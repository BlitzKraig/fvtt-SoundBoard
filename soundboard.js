class SoundBoard {

    static sounds = {}
    static soundIdPairs = [];
    static currentlyPlayingSounds = [];

    static LOGTYPE = {
        LOG: 0,
        WARN: 1,
        ERR: 2
    }

    static soundsLoaded = false;
    static soundsError = false;

    static log(message, logLevel = SoundBoard.LOGTYPE.LOG) {
        switch (logLevel) {
            case SoundBoard.LOGTYPE.LOG:
                console.log(`SoundBoard | ${message}`);
                break;
            case SoundBoard.LOGTYPE.WARN:
                console.warn(`SoundBoard | ${message}`);
                break;
            case SoundBoard.LOGTYPE.ERR:
                console.error(`SoundBoard | ${message}`);
                break;
            default:
                console.log(`SoundBoard | ${message}`);
                break;
        }
    }

    static handlebarsHelpers = {
        "soundboard-safeid": (str) => {
            return str.replace(/\s/g, '-');
        },
        "soundboard-getarraycount": (array) => {
            return array.length;
        }
    }

    static openSoundBoard() {
        if (SoundBoard.soundsError) {
            ui.notifications.error(game.i18n.localize("SOUNDBOARD.notif.soundsError"))
            return;
        }
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize("SOUNDBOARD.notif.soundsNotLoaded"))
            return;
        }
        new SoundBoardApplication().render(true);
    }

    static updateVolume(volumePercentage) {
        game.settings.set("SoundBoard", "soundboardServerVolume", volumePercentage)
    }

    static getVolume() {
        let serverVolume = game.settings.get("SoundBoard", "soundboardServerVolume") / 100;
        return serverVolume;
    }

    static async playSound(soundId, volume = 0.8) {
        // SoundBoard.currentlyPlayingSounds.push(AudioHelper.play({
        //     src: SoundBoard.soundIdPairs[soundId],
        //     volume: volume,
        //     autoplay: true,
        //     loop: false
        // }, true));
        let src = SoundBoard.soundIdPairs[soundId][Math.floor(Math.random() * SoundBoard.soundIdPairs[soundId].length)]
        AudioHelper.play({
            src: src,
            volume: SoundBoard.getVolume(),
            autoplay: true,
            loop: false
        }, true)
    }

    static async previewSound(soundId, volume = 0.8) {
        let src = SoundBoard.soundIdPairs[soundId][Math.floor(Math.random() * SoundBoard.soundIdPairs[soundId].length)]
        AudioHelper.play({
            src: src,
            volume: SoundBoard.getVolume(),
            autoplay: true,
            loop: false
        }, false)
    }

    static stopAllSounds() {
        // Needs more work to stop for connected clients
        SoundBoard.currentlyPlayingSounds.forEach((sound) => {
            sound.stop();
        });
    }

    static clearStoppedSounds() {
        SoundBoard.currentlyPlayingSounds = SoundBoard.currentlyPlayingSounds.filter(function (sound) {
            return sound.playing();
        });
    }

    static async getSounds() {
        SoundBoard.soundsError = false;
        SoundBoard.soundsLoaded = false;
        try {
            SoundBoard.sounds = {};
            SoundBoard.soundIdPairs = [];
            var soundboardDirArray = await FilePicker.browse("data", game.settings.get("SoundBoard", "soundboardDirectory"));
            if(soundboardDirArray.target != game.settings.get("SoundBoard", "soundboardDirectory")){
                throw "Filepicker target did not match input. Parent directory may be correct. Soft failure.";
            }
            var id = 0;

            for (const dir of soundboardDirArray.dirs) {
                const dirShortName = dir.split(/[\/]+/).pop();
                SoundBoard.sounds[dirShortName] = [];
                let innerDirArray = await FilePicker.browse("data", dir);
                for (const wildcardDir of innerDirArray.dirs) {
                    let wildcardFileArray = await FilePicker.browse("data", wildcardDir);
                    wildcardFileArray = wildcardFileArray.files;
                    wildcardFileArray = wildcardFileArray.filter(function (file) {
                        switch (file.substring(file.length - 4)) {
                            case ".ogg":
                            case ".mp3":
                            case ".wav":
                            case "flac":
                                return true;
                            default:
                                SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
                                return false;
                        }
                    });
                    SoundBoard.sounds[dirShortName].push({
                        name: wildcardDir.split(/[\/]+/).pop(),
                        src: wildcardFileArray,
                        id: id,
                        isWild: true
                    });
                    SoundBoard.soundIdPairs[id++] = wildcardFileArray;

                };
                for (const file of innerDirArray.files) {
                    switch (file.substring(file.length - 4)) {
                        case ".ogg":
                        case ".mp3":
                        case ".wav":
                        case "flac":
                            SoundBoard.sounds[dirShortName].push({
                                name: file.split(/[\/]+/).pop(),
                                src: [file],
                                id: id,
                                isWild: false
                            });
                            SoundBoard.soundIdPairs[id++] = [file];
                            break;

                        default:
                            SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
                            break;
                    }
                };
            }

        } catch (error) {
            SoundBoard.log(error, SoundBoard.LOGTYPE.ERR);
            SoundBoard.soundsError = true;
        } finally {
            SoundBoard.soundsLoaded = true;
        }
    }

    static async onInit() {
        // Consider checking for GM to skip this on connected clients, though can't get that on init
        game.settings.register("SoundBoard", "soundboardDirectory", {
            name: "SOUNDBOARD.settings.name.directory",
            hint: "SOUNDBOARD.settings.hint.directory",
            scope: "world",
            config: true,
            default: "modules/SoundBoard/audio/",
            onChange: value => {
                SoundBoard.getSounds();
            }
        });

        game.settings.register("SoundBoard", "soundboardServerVolume", {
            name: "Server Volume",
            scope: "world",
            config: false,
            type: Number,
            default: 100
        })

        SoundBoard.soundsError = false;
        await SoundBoard.getSounds();

        Handlebars.registerHelper(SoundBoard.handlebarsHelpers);

        // setInterval(() => {
        //     SoundBoard.clearStoppedSounds();
        // }, 10000);

    }

    static addSoundBoard(controls) {
        let soundControls = controls.find(control => control.name === "sounds")
        soundControls.tools.push({
            name: "soundboard",
            title: "SOUNDBOARD.button.openSoundboard",
            icon: "fas fa-border-all",
            visible: game.user.isGM,
            onClick: () => SoundBoard.openSoundBoard(),
            button: true
        })
    }
    static addSoundBoardSidebar(app, html) {
        if (!game.user.isGM) {
            return;
        }
        if (app.options.id == "playlists") {
            let button = $("<button class='open-soundboard'><i class='fas fa-border-all'></i> " + game.i18n.localize('SOUNDBOARD.button.openSoundboard') + "</button>");
            button.click(SoundBoard.openSoundBoard);
            html.find(".directory-footer").prepend(button);
        }
    }

    // static onApplicationRender(application, html, data) {
    //     let element = html.find(".window-header .window-title")
    // 	PopoutModule.addPopout(element, application, `ui.windows[${application.appId}]`, "renderSidebar");
    // }
}

Hooks.on("init", SoundBoard.onInit);
Hooks.on("getSceneControlButtons", SoundBoard.addSoundBoard);
Hooks.on("renderSidebarTab", SoundBoard.addSoundBoardSidebar);
// Hooks.on("renderSoundBoardApplication", SoundBoard.onApplicationRender);