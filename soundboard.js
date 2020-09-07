class SoundBoardApplication extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("SOUNDBOARD.app.title");
        options.id = "soundboard-app";
        options.template = "modules/SoundBoard/templates/soundboard.html";
        options.width = 700;
        options.resizable = true;
        return options;
        // TODO: Look into TabsV2 impl.
    }
    formatName(name) {
        name = name.split('.')[0];
        name = name.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
        name = name.replace(/_|-|[%20]/g, ' ');
        name = name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        name = name.replace(/\s\s+/g, ' ');
        return name;
    }
    getData() {
        var sounds = []
        var totalCount = 0;

        Object.keys(SoundBoard.sounds).forEach(key => {
            totalCount += SoundBoard.sounds[key].length;
            if (SoundBoard.sounds[key].length > 0) {
                sounds.push({
                    categoryName: this.formatName(key),
                    length: SoundBoard.sounds[key].length,
                    files: SoundBoard.sounds[key].map(element => {
                        element.name = this.formatName(element.name);
                        return element;
                    })
                });
            }
        });
        var volume = game.settings.get("SoundBoard", "soundboardServerVolume");
        return {
            sounds,
            volume,
            totalCount
        }
    }
   
}

class SoundBoard {

    static sounds = {
        uncategorized: []
    }
    static soundIdPairs = [];
    static currentlyPlayingSounds = [];

    static LOGTYPE = {
        LOG: 0,
        WARN: 1,
        ERR: 2
    }

    static soundsLoaded = false;

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
        if(!SoundBoard.soundsLoaded){
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
        SoundBoard.sounds = {
            uncategorized: []
        };
        SoundBoard.soundIdPairs = [];
        var soundboardDirArray = await FilePicker.browse("data", game.settings.get("SoundBoard", "soundboardDirectory"));
        var id = 0;
        // for (const file of soundboardDirArray.files) {
        //     switch (file.substring(file.length - 4)) {
        //         case ".ogg":
        //         case ".mp3":
        //         case ".wav":
        //         case "flac":
        //             SoundBoard.sounds.uncategorized.push({
        //                 name: file.split(/[\/]+/).pop(),
        //                 src: file,
        //                 id: id
        //             });
        //             SoundBoard.soundIdPairs[id++] = file;
        //             break;

        //         default:
        //             SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
        //             break;
        //     }
        // };
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
        // game.settings.register("SoundBoard", "soundboardVolume", {
        //     name: "SOUNDBOARD.settings.name.volume",
        //     scope: "client",
        //     config: true,
        //     type: Number,
        //     range: {
        //         min: 0.1,
        //         max: 1,
        //         step: 0.05
        //     },
        //     default: 1
        // })
        game.settings.register("SoundBoard", "soundboardServerVolume", {
            name: "Server Volume",
            scope: "world",
            config: false,
            type: Number,
            default: 100
        })
        SoundBoard.soundsLoaded = false;
        await SoundBoard.getSounds();
        SoundBoard.soundsLoaded = true;
        
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

    // static onApplicationRender(application, html, data) {
    //     let element = html.find(".window-header .window-title")
	// 	PopoutModule.addPopout(element, application, `ui.windows[${application.appId}]`, "renderSidebar");
    // }
}

Hooks.on("init", SoundBoard.onInit);
Hooks.on("getSceneControlButtons", SoundBoard.addSoundBoard);
// Hooks.on("renderSoundBoardApplication", SoundBoard.onApplicationRender);