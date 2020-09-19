class SoundBoard {

    static sounds = {}
    static favoriteSounds = {};
    static bundledSounds = {};
    static currentlyPlayingSounds = [];

    static LOGTYPE = {
        LOG: 0,
        WARN: 1,
        ERR: 2
    }

    static soundsLoaded = false;
    static soundsError = false;

    static socketHelper;
    static audioHelper;

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
    static openSoundBoardFav() {
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize("SOUNDBOARD.notif.soundsNotLoaded"))
            return;
        }
        new SoundBoardFavApplication().render(true);
    }
    static openSoundBoardBundled() {
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize("SOUNDBOARD.notif.soundsNotLoaded"))
            return;
        }
        new SoundBoardBundledApplication().render(true);
    }

    static updateVolume(volumePercentage) {
        game.settings.set("SoundBoard", "soundboardServerVolume", volumePercentage)
    }

    static getVolume() {
        let serverVolume = game.settings.get("SoundBoard", "soundboardServerVolume") / 100;
        return serverVolume;
    }

    static async playSoundOrStopLoop(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
        if(sound.isLoop){
            SoundBoard.stopLoop(identifyingPath);
        } else {
            SoundBoard.playSound(identifyingPath);
        }
    }

    static async playSound(identifyingPath, push = true) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath)
        let volume = SoundBoard.getVolume();
        let src = sound.src[Math.floor(Math.random() * sound.src.length)]
        let payload = {
            src,
            volume
        }
        SoundBoard.audioHelper.play(payload, sound);
        if (push) {
            SoundBoard.socketHelper.sendData({
                type: SBSocketHelper.SOCKETMESSAGETYPE.PLAY,
                payload
            });
        }
    }

    static async previewSound(identifyingPath) {
        SoundBoard.playSound(identifyingPath, false);
    }

    static getSoundFromIdentifyingPath(identifyingPath) {
        var sound;
        Object.keys(SoundBoard.sounds).forEach((key) => {
            if(sound){
                return;
            }
            sound = SoundBoard.sounds[key].find((element) => {
                return element.identifyingPath == identifyingPath
            })
        });
        Object.keys(SoundBoard.bundledSounds).forEach((key) => {
            if(sound){
                return;
            }
            sound = SoundBoard.bundledSounds[key].find((element) => {
                return element.identifyingPath == identifyingPath
            })
        });
        return sound;
    }

    static updateAllSounds(property, value) {
        Object.keys(SoundBoard.sounds).forEach((key) => {
            SoundBoard.sounds[key].forEach((o, i, a) => {
                a[i][property] = value;
            })
        });
        Object.keys(SoundBoard.bundledSounds).forEach((key) => {
            SoundBoard.bundledSounds[key].forEach((o, i, a) => {
                a[i][property] = value;
            })
        });
    }

    static favoriteSound(identifyingPath) {
        let favoriteArray = game.settings.get("SoundBoard", "favoritedSounds");
        if(favoriteArray.includes(identifyingPath)){
            return;
        }
        favoriteArray.push(identifyingPath)
        console.log(favoriteArray);
        game.settings.set("SoundBoard", "favoritedSounds", favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = true;
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).addClass('favorited');
    }

    static unfavoriteSound(identifyingPath) {
        let favoriteArray = game.settings.get("SoundBoard", "favoritedSounds");
        
        if(!favoriteArray.includes(identifyingPath)){
            return;
        }
        favoriteArray.splice(favoriteArray.findIndex((element)=>{return element==identifyingPath}),1);
        console.log(favoriteArray);
        game.settings.set("SoundBoard", "favoritedSounds", favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = false;
        
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).removeClass('favorited');
    }

    static startLoop(identifyingPath){
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath)
        if (sound.isLoop){
            return;
        }
        sound.isLoop = true;
        SoundBoard.playSound(identifyingPath);

        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).addClass('loop-active');
    }
    
    static stopLoop(identifyingPath){
        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isLoop = false;
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).removeClass('loop-active');
    }

    static setLoopDelay(identifyingPath, delayInSeconds, button) {
        if(delayInSeconds < 0){
            delayInSeconds = 0;
        } else if (delayInSeconds > 600){
            delayInSeconds = 600;
        }
        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).loopDelay = delayInSeconds;
        if(!SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isLoop){
            SoundBoard.startLoop(identifyingPath);
        }
        $(button).siblings('.dropdown-item').removeClass('active');
        $(button).siblings().children('.dropdown-item').removeClass('active');
        $(button).parent().siblings('.dropdown-item').removeClass('active');
        $(button).addClass('active');
    }

    static stopAllSounds() {
        SoundBoard.audioHelper.stopAll();
        SoundBoard.socketHelper.sendData({
            type: SBSocketHelper.SOCKETMESSAGETYPE.STOPALL
        });
        SoundBoard.audioHelper.delayIntervals.clearAll();
        SoundBoard.updateAllSounds('isLoop', false);
        $('#soundboard-app .btn').removeClass('loop-active');

    }

    static clearStoppedSounds() {
        SoundBoard.currentlyPlayingSounds = SoundBoard.currentlyPlayingSounds.filter(function (sound) {
            return sound.playing();
        });
    }

    static async _getBundledSounds() {
        const favoritesArray = game.settings.get("SoundBoard", "favoritedSounds");
        SoundBoard.bundledSounds = {};

        var soundboardDirArray = await FilePicker.browse("data", "modules/SoundBoard/bundledAudio/");
            for (const dir of soundboardDirArray.dirs) {
                const dirShortName = dir.split(/[\/]+/).pop();
                SoundBoard.bundledSounds[dirShortName] = [];
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
                    SoundBoard.bundledSounds[dirShortName].push({
                        name: wildcardDir.split(/[\/]+/).pop(),
                        src: wildcardFileArray,
                        id: SoundBoard.soundIdCounter,
                        identifyingPath: wildcardDir,
                        isWild: true,
                        isFavorite: favoritesArray.includes(wildcardDir)
                    });

                };
                for (const file of innerDirArray.files) {
                    switch (file.substring(file.length - 4)) {
                        case ".ogg":
                        case ".mp3":
                        case ".wav":
                        case "flac":
                            SoundBoard.bundledSounds[dirShortName].push({
                                name: file.split(/[\/]+/).pop(),
                                src: [file],
                                id: SoundBoard.soundIdCounter,
                                identifyingPath: file,
                                isWild: false,
                                isFavorite: favoritesArray.includes(file)
                            });
                            break;

                        default:
                            SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
                            break;
                    }
                };
            }
        
        SoundBoard.soundsLoaded = true;
    }

    static async getSounds() {
        const favoritesArray = game.settings.get("SoundBoard", "favoritedSounds");

        SoundBoard.soundsError = false;
        SoundBoard.soundsLoaded = false;
        try {
            SoundBoard.sounds = {};
            var soundboardDirArray = await FilePicker.browse("data", game.settings.get("SoundBoard", "soundboardDirectory"));
            if (soundboardDirArray.target != game.settings.get("SoundBoard", "soundboardDirectory")) {
                throw "Filepicker target did not match input. Parent directory may be correct. Soft failure.";
            }
            SoundBoard.soundIdCounter = 0;

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
                        id: SoundBoard.soundIdCounter,
                        identifyingPath: wildcardDir,
                        isWild: true,
                        isFavorite: favoritesArray.includes(wildcardDir)
                    });

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
                                id: SoundBoard.soundIdCounter,
                                identifyingPath: file,
                                isWild: false,
                                isFavorite: favoritesArray.includes(file)
                            });
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
            SoundBoard._getBundledSounds();
        }
    }

    static async onInit() {
        game.settings.register("SoundBoard", "soundboardDirectory", {
            name: "SOUNDBOARD.settings.directory.name",
            hint: "SOUNDBOARD.settings.directory.hint",
            scope: "world",
            config: true,
            default: "modules/SoundBoard/exampleAudio/",
            onChange: value => {
                if (value.length <= 0) {
                    game.settings.set("SoundBoard", "soundboardDirectory", "modules/SoundBoard/exampleAudio/")
                }
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

        game.settings.register("SoundBoard", "favoritedSounds", {
            name: "Favorited Sounds",
            scope: "world",
            config: false,
            default: []
        })

        if (game.user.isGM) {
            SoundBoard.soundsError = false;
            await SoundBoard.getSounds();
            Handlebars.registerHelper(SoundBoard.handlebarsHelpers);
        }

        SoundBoard.socketHelper = new SBSocketHelper(game.user.isGM);
        SoundBoard.audioHelper = new SBAudioHelper();

    }

    static addSoundBoard(controls) {
        let soundControls = controls.find(control => control.name === "sounds")
        soundControls.tools.push({
            name: "soundboard",
            title: "SOUNDBOARD.button.openSoundboard",
            icon: "fas fa-border-all",
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoard,
            button: true
        });
        soundControls.tools.push({
            name: "soundboardfav",
            title: "SOUNDBOARD.button.openSoundboardFav",
            icon: "fas fa-star",
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoardFav,
            button: true
        });
        soundControls.tools.push({
            name: "soundboardbundled",
            title: "SOUNDBOARD.button.openSoundboardBundled",
            icon: "fas fa-box-open",
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoardBundled,
            button: true
        });
        soundControls.tools.push({
            name: "soundboardstop",
            title: "SOUNDBOARD.button.stopAllTool",
            icon: "far fa-stop-circle",
            visible: game.user.isGM,
            onClick: SoundBoard.stopAllSounds,
            button: true
        });
    }
    static addCustomPlaylistElements(app, html) {
        if (!game.user.isGM) {
            return;
        }
        if (app.options.id == "playlists") {
            let button = $("<button class='open-soundboard'><i class='fas fa-border-all'></i> " + game.i18n.localize('SOUNDBOARD.button.openSoundboard') + "</button>");
            button.click(SoundBoard.openSoundBoard);
            html.find(".directory-footer").prepend(button);
            html.find(".sound-name").toArray().filter((el)=>el.innerText == game.i18n.localize('PLAYLIST.VolInterface'))[0].innerText = game.i18n.localize('SOUNDBOARD.slider.interface');
        }
    }
}

Hooks.once("ready", SoundBoard.onInit);
Hooks.on("getSceneControlButtons", SoundBoard.addSoundBoard);
Hooks.on("renderSidebarTab", SoundBoard.addCustomPlaylistElements);