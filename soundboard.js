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

    static targettedPlayerID;
    static cacheMode = false;

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
        let volume = volumePercentage / 100;
        SoundBoard.audioHelper.onVolumeChange(volume);
        SoundBoard.socketHelper.sendData({
            type: SBSocketHelper.SOCKETMESSAGETYPE.VOLUMECHANGE,
            payload: {
                volume
            }
        });
        game.settings.set("SoundBoard", "soundboardServerVolume", volumePercentage)
    }

    static getVolume() {
        let serverVolume = game.settings.get("SoundBoard", "soundboardServerVolume") / 100;
        return serverVolume;
    }

    static async playSoundOrStopLoop(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);

        if (keyboard._downKeys.has("Alt")) {
            if (sound.isFavorite) {
                this.unfavoriteSound(identifyingPath);
            } else {
                this.favoriteSound(identifyingPath)
            }
        } else if (sound.isLoop) {
            SoundBoard.stopLoop(identifyingPath);
        } else if (keyboard._downKeys.has("Control")) {
            this.stopSound(identifyingPath)
        }  else if (keyboard._downKeys.has("Shift")) {
            this.startLoop(identifyingPath);
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
        if (SoundBoard.cacheMode) {
            SoundBoard.audioHelper.cache(payload);
            if (push) {
                SoundBoard.socketHelper.sendData({
                    type: SBSocketHelper.SOCKETMESSAGETYPE.CACHE,
                    payload
                });
            }
        } else {
            if (SoundBoard.targettedPlayerID) {
                payload.target = SoundBoard.targettedPlayerID;
            }
            SoundBoard.audioHelper.play(payload, sound);
            if (push) {
                SoundBoard.socketHelper.sendData({
                    type: SBSocketHelper.SOCKETMESSAGETYPE.PLAY,
                    payload
                });
            }
        }
    }

    static async previewSound(identifyingPath) {
        SoundBoard.playSound(identifyingPath, false);
    }

    static async targetPlayer(html, id) {
        // console.log(html);
        $(html).addClass('active');
        $(html).siblings().removeClass('active');
        if (!id) {
            $(html).parent().siblings("#granular-send").removeClass('active');
            SoundBoard.targettedPlayerID = undefined;
        } else {
            $(html).parent().siblings("#granular-send").addClass('active');
            SoundBoard.targettedPlayerID = id;
            // TODO Consider making this an array, and allowing multi targets
        }
    }

    static toggleCacheMode(html) {
        SoundBoard.cacheMode = !SoundBoard.cacheMode;
        if (SoundBoard.cacheMode) {
            $(html).addClass('active');
        } else {
            $(html).removeClass('active');
        }
    }

    static getSoundFromIdentifyingPath(identifyingPath) {
        var sound;
        Object.keys(SoundBoard.sounds).forEach((key) => {
            if (sound) {
                return;
            }
            sound = SoundBoard.sounds[key].find((element) => {
                return element.identifyingPath == identifyingPath
            })
        });
        Object.keys(SoundBoard.bundledSounds).forEach((key) => {
            if (sound) {
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
        if (favoriteArray.includes(identifyingPath)) {
            return;
        }
        favoriteArray.push(identifyingPath)
        game.settings.set("SoundBoard", "favoritedSounds", favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = true;
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).addClass('favorited');
    }

    static unfavoriteSound(identifyingPath) {
        let favoriteArray = game.settings.get("SoundBoard", "favoritedSounds");

        if (!favoriteArray.includes(identifyingPath)) {
            return;
        }
        favoriteArray.splice(favoriteArray.findIndex((element) => {
            return element == identifyingPath
        }), 1);
        game.settings.set("SoundBoard", "favoritedSounds", favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = false;

        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).removeClass('favorited');
    }

    static startLoop(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath)
        if (sound.isLoop) {
            return;
        }
        sound.isLoop = true;
        SoundBoard.playSound(identifyingPath);

        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).addClass('loop-active');
    }

    static stopLoop(identifyingPath) {
        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isLoop = false;
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).removeClass('loop-active');
    }

    static setLoopDelay(identifyingPath, delayInSeconds, button) {
        if (delayInSeconds < 0) {
            delayInSeconds = 0;
        } else if (delayInSeconds > 600) {
            delayInSeconds = 600;
        }
        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).loopDelay = delayInSeconds;
        if (!SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isLoop) {
            SoundBoard.startLoop(identifyingPath);
        }
        $(button).siblings('.dropdown-item').removeClass('active');
        $(button).siblings().children('.dropdown-item').removeClass('active');
        $(button).parent().siblings('.dropdown-item').removeClass('active');
        $(button).addClass('active');
    }

    static stopSound(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
        SoundBoard.audioHelper.stop(sound);
        SoundBoard.socketHelper.sendData({
            type: SBSocketHelper.SOCKETMESSAGETYPE.STOP,
            payload: sound
        });
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
                        case ".oga":
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
                    case ".oga":
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

        var source = game.settings.get("SoundBoard", "source");

        SoundBoard.soundsError = false;
        SoundBoard.soundsLoaded = false;
        try {
            SoundBoard.sounds = {};
            if (source === 's3') {
                const bucketContainer = await FilePicker.browse(source, game.settings.get('SoundBoard', 'soundboardDirectory'));
                var bucket = bucketContainer.dirs[0]
            }
            var soundboardDirArray = await FilePicker.browse(source, game.settings.get("SoundBoard", "soundboardDirectory"), {
                ...(bucket && {
                    bucket
                })
            });
            if (soundboardDirArray.target != game.settings.get("SoundBoard", "soundboardDirectory")) {
                throw "Filepicker target did not match input. Parent directory may be correct. Soft failure.";
            }
            SoundBoard.soundIdCounter = 0;

            for (const dir of soundboardDirArray.dirs) {
                const dirShortName = dir.split(/[\/]+/).pop();
                SoundBoard.sounds[dirShortName] = [];
                let innerDirArray = await FilePicker.browse(source, dir, {
                    ...(bucket && {
                        bucket
                    })
                });
                for (const wildcardDir of innerDirArray.dirs) {
                    let wildcardFileArray = await FilePicker.browse(source, wildcardDir, {
                        ...(bucket && {
                            bucket
                        })
                    });
                    wildcardFileArray = wildcardFileArray.files;
                    wildcardFileArray = wildcardFileArray.filter(function (file) {
                        switch (file.substring(file.length - 4)) {
                            case ".ogg":
                            case ".oga":
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
                        case ".oga":
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

        game.settings.register("SoundBoard", "source", {
            name: "SOUNDBOARD.settings.source.name",
            hint: "SOUNDBOARD.settings.source.hint",
            scope: "world",
            config: true,
            type: String,
            choices: {
                "data": "SOUNDBOARD.settings.source.data",
                "forgevtt": "SOUNDBOARD.settings.source.forgevtt",
                "s3": "SOUNDBOARD.settings.source.s3"
            },
            default: "data",
            onChange: value => {
                SoundBoard.getSounds();
            }
        })

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

        // Check if an onChange fn already exists
        if (!game.settings.settings.get("core.globalInterfaceVolume").onChange) {
            // No onChange fn, just use ours
            game.settings.settings.get("core.globalInterfaceVolume").onChange = (volume) => {
                SoundBoard.audioHelper.onVolumeChange(game.settings.get("SoundBoard", "soundboardServerVolume") / 100);
            }
        } else {
            // onChange fn exists, call the original inside our own
            var originalGIOnChange = game.settings.settings.get("core.globalInterfaceVolume").onChange;
            game.settings.settings.get("core.globalInterfaceVolume").onChange = (volume) => {
                originalGIOnChange(volume);
                SoundBoard.audioHelper.onVolumeChange(game.settings.get("SoundBoard", "soundboardServerVolume") / 100);
            }
        }

        if (game.user.isGM) {
            SoundBoard.soundsError = false;
            await SoundBoard.getSounds();
            Handlebars.registerHelper(SoundBoard.handlebarsHelpers);
        }

        SoundBoard.socketHelper = new SBSocketHelper();
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
        }
    }
}

Hooks.once("ready", SoundBoard.onInit);
Hooks.on("getSceneControlButtons", SoundBoard.addSoundBoard);
Hooks.on("renderSidebarTab", SoundBoard.addCustomPlaylistElements);