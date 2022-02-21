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
    static macroMode = false;
    static volumeMode = false;

    static openedBoard;

    static socketHelper;
    static audioHelper;
    static packageManager;

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
        'soundboard-safeid': (str) => {
            return 'sbsafe-' + str.toLowerCase().replace(/[^a-z0-9]/g, function(s) {
                var c = s.charCodeAt(0);
                if (c == 32) return '-';
                return '__' + ('000' + c.toString(16)).slice(-4);
            });
        },
        'soundboard-getarraycount': (array) => {
            return array.length;
        },
        'soundboard-escape': (str) => {
            return str.replace(/(')/g, '\\$1');
        },
        'get-individual-volume': (identifyingPath) => {
            return this.getVolumeForSound(identifyingPath);
        }
    }

    static openSoundBoard() {
        if (SoundBoard.soundsError) {
            ui.notifications.error(game.i18n.localize('SOUNDBOARD.notif.soundsError'));
            return;
        }
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize('SOUNDBOARD.notif.soundsNotLoaded'));
            return;
        }
        SoundBoard.openedBoard = new SoundBoardApplication();
        SoundBoard.openedBoard.render(true);
        try{
            SoundBoard.openedBoard.bringToTop();
        } catch(e){}
    }
    static openSoundBoardFav() {
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize('SOUNDBOARD.notif.soundsNotLoaded'));
            return;
        }
        SoundBoard.openedBoard = new SoundBoardFavApplication();
        SoundBoard.openedBoard.render(true);
        try{
            SoundBoard.openedBoard.bringToTop();
        } catch(e){}
    }
    static openSoundBoardBundled() {
        if (!SoundBoard.soundsLoaded) {
            ui.notifications.warn(game.i18n.localize('SOUNDBOARD.notif.soundsNotLoaded'));
            return;
        }
        SoundBoard.openedBoard = new SoundBoardBundledApplication();
        SoundBoard.openedBoard.render(true);
        try{
            SoundBoard.openedBoard.bringToTop();
        } catch(e){}
    }

    static openSoundBoardHelp() {
        try{
            new SoundBoardHelp().render(true).bringToTop();
        } catch(e){}
    }

    static openSoundBoardPackageManager() {
        try{
            new SoundBoardPackageManagerApplication(SoundBoard.packageManager).render(true).bringToTop();
        } catch(e){}
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
        game.settings.set('SoundBoard', 'soundboardServerVolume', volumePercentage);
    }

    static updateVolumeForSound(volumePercentage, identifyingPath) {
        const originalSoundVolumes = game.settings.get('SoundBoard', 'soundboardIndividualSoundVolumes');
        let individualVolumes = { ...originalSoundVolumes, [identifyingPath]: volumePercentage }
        game.settings.set('SoundBoard', 'soundboardIndividualSoundVolumes', individualVolumes);

        let sbVolume = SoundBoard.getVolume()
        SoundBoard.audioHelper.onVolumeChange(sbVolume, individualVolumes);
        SoundBoard.socketHelper.sendData({
            type: SBSocketHelper.SOCKETMESSAGETYPE.VOLUMECHANGE,
            payload: {
                volume: sbVolume,
                individualVolumes
            }
        });
        
    }

    static getVolume() {
        let serverVolume = game.settings.get('SoundBoard', 'soundboardServerVolume') / 100;
        return serverVolume;
    }

    static getVolumeForSound(identifyingPath) {
        const individualSoundVolumes = game.settings.get('SoundBoard', 'soundboardIndividualSoundVolumes');
        if (individualSoundVolumes[identifyingPath]) {
            return parseInt(individualSoundVolumes[identifyingPath]);
        } else {
            return 100;
        }
    }

    static async playSoundOrStopLoop(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);

        if (keyboard._downKeys.has('Alt')) {
            if (sound.isFavorite) {
                this.unfavoriteSound(identifyingPath);
            } else {
                this.favoriteSound(identifyingPath);
            }
        } else if (sound.isLoop) {
            SoundBoard.stopLoop(identifyingPath);
        } else if (keyboard._downKeys.has('Control')) {
            this.stopSound(identifyingPath);
        } else if (keyboard._downKeys.has('Shift')) {
            this.startLoop(identifyingPath);
        } else {
            SoundBoard.playSound(identifyingPath);
        }

    }

    static async playSound(identifyingPath, push = true) {

        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
        let volume = SoundBoard.getVolume()
        sound.individualVolume = SoundBoard.getVolumeForSound(identifyingPath) / 100
        let soundIndex = Math.floor(Math.random() * sound.src.length);
        if(sound.lastPlayedIndex >= 0 && sound.src.length > 1 && sound.lastPlayedIndex == soundIndex){
            if(++soundIndex > sound.src.length -1){
                soundIndex = 0;
            }
        }
        sound.lastPlayedIndex = soundIndex;
        let src = sound.src[soundIndex];

        let detune = game.settings.get('SoundBoard', 'detuneAmount');
        
        if(detune > 0){
            if(SBAudioHelper.hasHowler()){
                detune /= 100;
                let normalizedAmount = Math.random() * detune;
                detune = 1 - detune/2 + normalizedAmount;
            } else {
                detune *= 10;
                let normalizedAmount = Math.random() * detune;
                detune = 0 - detune/2 + normalizedAmount;
            }
        }

        let payload = {
            src,
            volume,
            detune
        };
        if (SoundBoard.cacheMode) {
            SoundBoard.audioHelper.cache(payload);
            if (push) {
                SoundBoard.socketHelper.sendData({
                    type: SBSocketHelper.SOCKETMESSAGETYPE.CACHE,
                    payload
                });
            }
        } else if (SoundBoard.macroMode) {
            SBMacroHelper.generateMacro(sound.name);
        } else {
            if (SoundBoard.targettedPlayerID) {
                payload.target = SoundBoard.targettedPlayerID;
            }
            SoundBoard.audioHelper.play(payload, sound);
            if (push) {
                SoundBoard.socketHelper.sendData({
                    type: SBSocketHelper.SOCKETMESSAGETYPE.PLAY,
                    payload,
                    soundExtras: {identifyingPath: sound.identifyingPath, individualVolume: sound.individualVolume}
                });
            }
        }
    }

    static async playSoundByName(name, push = true) {
        if(!game.user.isGM){
            this.socketHelper.sendData({type:SBSocketHelper.SOCKETMESSAGETYPE.REQUESTMACROPLAY, payload:name});
            return;
        }
        let wasMacroMode = SoundBoard.macroMode;
        if (wasMacroMode) {
            SoundBoard.macroMode = false;
        }
        if (event?.shiftKey) {
            SoundBoard.cacheMode = true;
        }
        let sound;
        for (let key of Object.keys(SoundBoard.sounds)) {
            sound = SoundBoard.sounds[key].find((el) => {
                return el.name.toLowerCase() == name.toLowerCase();
            });
            if (sound) {
                break;
            }
        }
        if (!sound) {
            for (let key of Object.keys(SoundBoard.bundledSounds)) {
                sound = SoundBoard.bundledSounds[key].find((el) => {
                    return el.name.toLowerCase() == name.toLowerCase();
                });
                if (sound) {
                    break;
                }
            }
        }
        if (sound) {
            SoundBoard.playSound(sound.identifyingPath, push);
        }
        if (event?.shiftKey) {
            SoundBoard.cacheMode = false;
        }
        SoundBoard.macroMode = wasMacroMode;
    }

    static _formatName(name, shouldStripFileName = true) {
        if (shouldStripFileName) {
            if (name.indexOf('.') > -1 && name.indexOf('.') < name.length) {
                name = name.substr(0, name.lastIndexOf('.'));
            }
        }
        name = decodeURIComponent(name);

        // Turn _ and - into spaces. Allow multiple characters to display
        name = name.replace(/_(?! )|-(?! )/g, ' ');

        // Handle camelCase
        name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        // Add a space before numbers after letters
        name = name.replace(/([a-zA-Z])([0-9])/g, '$1 $2');

        // Uppercase letters after a space
        name = name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        return name;
    }

    static async previewSound(identifyingPath) {
        SoundBoard.playSound(identifyingPath, false);
    }

    static async targetPlayer(html, id) {
        // console.log(html);
        $(html).addClass('active');
        $(html).siblings().removeClass('active');
        if (!id) {
            $(html).parent().siblings('#granular-send').removeClass('active');
            SoundBoard.targettedPlayerID = undefined;
        } else {
            $(html).parent().siblings('#granular-send').addClass('active');
            SoundBoard.targettedPlayerID = id;
            // TODO Consider making this an array, and allowing multi targets
        }
    }

    static toggleCacheMode(html) {
        SoundBoard.cacheMode = !SoundBoard.cacheMode;
        if (SoundBoard.cacheMode) {
            $(html).find('#cache-sounds').addClass('active');

            // TODO find a better way to do this extensibly
            $(html).find('#macro-mode').removeClass('active');
            SoundBoard.macroMode = false;
        } else {
            $(html).find('#cache-sounds').removeClass('active');
        }
    }

    static toggleMacroMode(html) {
        SoundBoard.macroMode = !SoundBoard.macroMode;
        if (SoundBoard.macroMode) {
            $(html).find('#macro-mode').addClass('active');

            $(html).find('#cache-sounds').removeClass('active');
            SoundBoard.cacheMode = false;
        } else {
            $(html).find('#macro-mode').removeClass('active');
        }
    }

    static toggleVolumeMode(html) {
        if(SBAudioHelper.hasHowler()){
            ui.notifications.notify(game.i18n.localize("SOUNDBOARD.notif.individualVolumeVersionIncorrect"));
            return;
        }
        SoundBoard.volumeMode = !SoundBoard.volumeMode;
        if (SoundBoard.volumeMode) {
            $(html).find('#volume-mode').addClass('active');
            $('.sb-individual-volume').show("fast");
        } else {
            $(html).find('#volume-mode').removeClass('active');
            $('.sb-individual-volume').hide("fast");
        }
    }

    static promptDeleteMacros() {
        new Dialog({
            title: 'Delete SoundBoard Macros',
            content: '<h1>Delete SoundBoard Macros?</h1><p>Note, this will break any SoundBoard macro journal links.',
            buttons: {
                Ok: {
                    label: 'Ok',
                    callback: () => {
                        SBMacroHelper.deleteAllMacros();
                    }
                },
                Cancel: {
                    label: 'Cancel'
                }
            }
        }).render(true);
    }

    static getSoundFromIdentifyingPath(identifyingPath) {
        var sound;
        Object.keys(SoundBoard.sounds).forEach((key) => {
            if (sound) {
                return;
            }
            sound = SoundBoard.sounds[key].find((element) => {
                return element.identifyingPath == identifyingPath;
            });
        });
        Object.keys(SoundBoard.bundledSounds).forEach((key) => {
            if (sound) {
                return;
            }
            sound = SoundBoard.bundledSounds[key].find((element) => {
                return element.identifyingPath == identifyingPath;
            });
        });
        
        sound.identifyingPath = identifyingPath;
        return sound;
    }

    static updateAllSounds(property, value) {
        Object.keys(SoundBoard.sounds).forEach((key) => {
            SoundBoard.sounds[key].forEach((o, i, a) => {
                a[i][property] = value;
            });
        });
        Object.keys(SoundBoard.bundledSounds).forEach((key) => {
            SoundBoard.bundledSounds[key].forEach((o, i, a) => {
                a[i][property] = value;
            });
        });
    }

    static favoriteSound(identifyingPath) {
        let favoriteArray = game.settings.get('SoundBoard', 'favoritedSounds');
        if (favoriteArray.includes(identifyingPath)) {
            return;
        }
        favoriteArray.push(identifyingPath);
        game.settings.set('SoundBoard', 'favoritedSounds', favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = true;
        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).addClass('favorited');
    }

    static unfavoriteSound(identifyingPath) {
        let favoriteArray = game.settings.get('SoundBoard', 'favoritedSounds');

        if (!favoriteArray.includes(identifyingPath)) {
            return;
        }
        favoriteArray.splice(favoriteArray.findIndex((element) => {
            return element == identifyingPath;
        }), 1);
        game.settings.set('SoundBoard', 'favoritedSounds', favoriteArray);

        SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite = false;

        $('#soundboard-app .btn').filter(`[uuid=${$.escapeSelector(identifyingPath)}]`).removeClass('favorited');
    }

    static startLoop(identifyingPath) {
        let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
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
        const favoritesArray = game.settings.get('SoundBoard', 'favoritedSounds');
        SoundBoard.bundledSounds = {};

        for (const pack of this.packageManager.soundPacks){
            if(pack.disabled){
                continue;
            }
            
            let soundboardDirArray = await FilePicker.browse('data', pack.dir);
            for (const dir of soundboardDirArray.dirs) {
                const dirShortName = this._formatName(`${pack.name} - ${dir.split(/[/]+/).pop()}`, false);
                SoundBoard.bundledSounds[dirShortName] = [];
                let innerDirArray = await FilePicker.browse('data', dir);
                for (const wildcardDir of innerDirArray.dirs) {
                    let wildcardFileArray = await FilePicker.browse('data', wildcardDir);
                    wildcardFileArray = wildcardFileArray.files;
                    wildcardFileArray = wildcardFileArray.filter(function (file) {
                        switch (file.substring(file.length - 4)) {
                        case '.ogg':
                        case '.oga':
                        case '.mp3':
                        case '.webm':
                        case '.opus':
                        case '.wav':
                        case 'flac':
                            return true;
                        default:
                            SoundBoard.log(`${file} ${game.i18n.localize('SOUNDBOARD.log.invalidSound')}`, SoundBoard.LOGTYPE.WARN);
                            return false;
                        }
                    });
                    SoundBoard.bundledSounds[dirShortName].push({
                        name: this._formatName(wildcardDir.split(/[/]+/).pop(), false),
                        src: wildcardFileArray,
                        identifyingPath: wildcardDir,
                        isWild: true,
                        isFavorite: favoritesArray.includes(wildcardDir)
                    });

                }
                for (const file of innerDirArray.files) {
                    switch (file.substring(file.length - 4)) {
                    case '.ogg':
                    case '.oga':
                    case '.mp3':
                    case '.webm':
                    case '.opus':
                    case '.wav':
                    case 'flac':
                        SoundBoard.bundledSounds[dirShortName].push({
                            name: this._formatName(file.split(/[/]+/).pop()),
                            src: [file],
                            identifyingPath: file,
                            isWild: false,
                            isFavorite: favoritesArray.includes(file)
                        });
                        break;

                    default:
                        SoundBoard.log(`${file} ${game.i18n.localize('SOUNDBOARD.log.invalidSound')}`, SoundBoard.LOGTYPE.WARN);
                        break;
                    }
                }
            }
        }

        SoundBoard.soundsLoaded = true;
    }

    static async getSounds() {
        const favoritesArray = game.settings.get('SoundBoard', 'favoritedSounds');

        var source = game.settings.get('SoundBoard', 'source');

        SoundBoard.soundsError = false;
        SoundBoard.soundsLoaded = false;
        try {
            SoundBoard.sounds = {};
            if (source === 's3') {
                const bucketContainer = await FilePicker.browse(source, game.settings.get('SoundBoard', 'soundboardDirectory'));
                var bucket = bucketContainer.dirs[0];
            }
            var soundboardDirArray = await FilePicker.browse(source, game.settings.get('SoundBoard', 'soundboardDirectory'), {
                ...(bucket && {
                    bucket
                })
            });
            if (soundboardDirArray.target != game.settings.get('SoundBoard', 'soundboardDirectory')) {
                throw 'Filepicker target did not match input. Parent directory may be correct. Soft failure.';
            }

            for (const dir of soundboardDirArray.dirs) {
                const dirShortName = this._formatName(dir.split(/[/]+/).pop(), false);
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
                        case '.ogg':
                        case '.oga':
                        case '.mp3':
                        case '.wav':
                        case 'flac':
                            return true;
                        default:
                            SoundBoard.log(`${file} ${game.i18n.localize('SOUNDBOARD.log.invalidSound')}`, SoundBoard.LOGTYPE.WARN);
                            return false;
                        }
                    });
                    SoundBoard.sounds[dirShortName].push({
                        name: this._formatName(wildcardDir.split(/[/]+/).pop(), false),
                        src: wildcardFileArray,
                        identifyingPath: wildcardDir,
                        isWild: true,
                        isFavorite: favoritesArray.includes(wildcardDir)
                    });

                }
                for (const file of innerDirArray.files) {
                    switch (file.substring(file.length - 4)) {
                    case '.ogg':
                    case '.oga':
                    case '.mp3':
                    case '.wav':
                    case 'flac':
                        SoundBoard.sounds[dirShortName].push({
                            name: this._formatName(file.split(/[/]+/).pop()),
                            src: [file],
                            identifyingPath: file,
                            isWild: false,
                            isFavorite: favoritesArray.includes(file)
                        });
                        break;

                    default:
                        SoundBoard.log(`${file} ${game.i18n.localize('SOUNDBOARD.log.invalidSound')}`, SoundBoard.LOGTYPE.WARN);
                        break;
                    }
                }
            }

        } catch (error) {
            SoundBoard.log(error, SoundBoard.LOGTYPE.ERR);
            SoundBoard.soundsError = true;
        } finally {
            await SoundBoard._getBundledSounds();
        }
    }

    static async refreshSounds({notify, bringToTop} = {notify:true, bringToTop:true}) {
        if (game.user.isGM) {
            if(notify){
                ui.notifications.notify(game.i18n.localize('SOUNDBOARD.notif.refreshing'));
            }
            SoundBoard.stopAllSounds();
            SoundBoard.soundsError = false;
            await SoundBoard.getSounds();
            if(SoundBoard.openedBoard?.rendered){
                SoundBoard.openedBoard.render();
                if(bringToTop){
                    SoundBoard.openedBoard.bringToTop();
                }
            }
            if(notify){
                ui.notifications.notify(game.i18n.localize('SOUNDBOARD.notif.refreshComplete'));
            }
        }
    }

    static async onInit() {
        SoundBoard.packageManager = new SBPackageManager();
        Hooks.callAll('SBPackageManagerReady');

        game.settings.register('SoundBoard', 'soundboardDirectory', {
            name: game.i18n.localize('SOUNDBOARD.settings.directory.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.directory.hint'),
            scope: 'world',
            config: true,
            default: 'modules/SoundBoard/exampleAudio',
            onChange: value => {
                if (value.length <= 0) {
                    game.settings.set('SoundBoard', 'soundboardDirectory', 'modules/SoundBoard/exampleAudio');
                }
                SoundBoard.getSounds();
            },
            type: String,
            filePicker: true
        });

        game.settings.register('SoundBoard', 'source', {
            name: game.i18n.localize('SOUNDBOARD.settings.source.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.source.hint'),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                'data': game.i18n.localize('SOUNDBOARD.settings.source.data'),
                'forgevtt': game.i18n.localize('SOUNDBOARD.settings.source.forgevtt'),
                's3': game.i18n.localize('SOUNDBOARD.settings.source.s3')
            },
            default: 'data',
            // eslint-disable-next-line no-unused-vars
            onChange: value => {
                SoundBoard.getSounds();
            }
        });
        game.settings.register('SoundBoard', 'opacity', {
            name: game.i18n.localize('SOUNDBOARD.settings.opacity.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.opacity.hint'),
            scope: 'world',
            config: true,
            type: Number,
            range: {
                min: 0.1,
                max: 1.0,
                step: 0.05
            },
            default: 0.75,
            onChange: value => {
                $('#soundboard-app').css('opacity', value);
            }
        });

        game.settings.register('SoundBoard', 'detuneAmount', {
            name: game.i18n.localize('SOUNDBOARD.settings.detune.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.detune.hint'),
            scope: 'world',
            config: true,
            type: Number,
            range: {
                min: 0,
                max: 100,
                step: 1
            },
            default: 0
        });

        game.settings.register('SoundBoard', 'allowPlayersMacroRequest', {
            name: game.i18n.localize('SOUNDBOARD.settings.macroRequest.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.macroRequest.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });

        game.settings.register('SoundBoard', 'forcePopoutCompat', {
            name: game.i18n.localize('SOUNDBOARD.settings.popoutCompat.name'),
            hint: game.i18n.localize('SOUNDBOARD.settings.popoutCompat.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: value => {
                window.location.reload();
            }
        });

        game.settings.register('SoundBoard', 'soundboardServerVolume', {
            name: 'Server Volume',
            scope: 'world',
            config: false,
            type: Number,
            default: 100
        });

        game.settings.register('SoundBoard', 'soundboardIndividualSoundVolumes', {
            name: 'Server Volume',
            scope: 'world',
            config: false,
            type: Object,
            default: {}
        });
        
        game.settings.register('SoundBoard', 'favoritedSounds', {
            name: 'Favorited Sounds',
            scope: 'world',
            config: false,
            default: []
        });

        // Check if an onChange fn already exists
        if (!game.settings.settings.get('core.globalInterfaceVolume').onChange) {
            // No onChange fn, just use ours
            // eslint-disable-next-line no-unused-vars
            game.settings.settings.get('core.globalInterfaceVolume').onChange = (volume) => {
                SoundBoard.audioHelper.onVolumeChange(game.settings.get('SoundBoard', 'soundboardServerVolume') / 100);
            };
        } else {
            // onChange fn exists, call the original inside our own
            var originalGIOnChange = game.settings.settings.get('core.globalInterfaceVolume').onChange;
            game.settings.settings.get('core.globalInterfaceVolume').onChange = (volume) => {
                originalGIOnChange(volume);
                SoundBoard.audioHelper.onVolumeChange(game.settings.get('SoundBoard', 'soundboardServerVolume') / 100);
            };
        }

        if (game.user.isGM) {
            SoundBoard.soundsError = false;
            await SoundBoard.getSounds();
            Handlebars.registerHelper(SoundBoard.handlebarsHelpers);
            Handlebars.registerPartial('SoundBoardPackageCard', await getTemplate('modules/SoundBoard/templates/partials/packagecard.hbs'));
        }

        SoundBoard.socketHelper = new SBSocketHelper();
        SoundBoard.audioHelper = new SBAudioHelper();

        if(game.settings.get('SoundBoard', 'forcePopoutCompat')){

            // Very dirty - force our code over popout modules, allowing SB to play

            // Consider attaching the SoundBoard to the application somehow, instead of calling its singleton
            PopoutModule.prototype.createDocument = () => {
                const html = document.createElement("html");
                const head = document.importNode(document.getElementsByTagName("head")[0], true);
                const body = document.importNode(document.getElementsByTagName("body")[0], false);
                
                // for (const child of [...head.children]) {
                //     if (child.nodeName === "SCRIPT" && child.src) {
                //         const src = child.src.replace(window.location.origin, "");
                //         if (!src.match(/tinymce|jquery|webfont|pdfjs|SoundBoard/)) {
                //             //child.remove();
                //         }
                //     }
                // }
                html.appendChild(head);
                html.appendChild(body);
                return html;
            };
        }
    }

    static addSoundBoard(controls) {
        let soundControls = controls.find(control => control.name === 'sounds');
        soundControls.tools.push({
            name: 'soundboard',
            title: game.i18n.localize('SOUNDBOARD.button.openSoundboard'),
            icon: 'fas fa-border-all',
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoard,
            button: true
        });
        soundControls.tools.push({
            name: 'soundboardfav',
            title: game.i18n.localize('SOUNDBOARD.button.openSoundboardFav'),
            icon: 'fas fa-star',
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoardFav,
            button: true
        });
        soundControls.tools.push({
            name: 'soundboardbundled',
            title: game.i18n.localize('SOUNDBOARD.button.openSoundboardBundled'),
            icon: 'fas fa-box-open',
            visible: game.user.isGM,
            onClick: SoundBoard.openSoundBoardBundled,
            button: true
        });
        soundControls.tools.push({
            name: 'soundboardstop',
            title: game.i18n.localize('SOUNDBOARD.button.stopAllTool'),
            icon: 'far fa-stop-circle',
            visible: game.user.isGM,
            onClick: SoundBoard.stopAllSounds,
            button: true
        });
        soundControls.tools.push({
            name: 'soundboardpackman',
            title: game.i18n.localize('SOUNDBOARD.button.packageManagerTool'),
            icon: 'fas fa-tasks',
            visible: game.user.isGM,
            onClick: ()=>SoundBoard.openSoundBoardPackageManager(SoundBoard.packageManager),
            button: true
        });
    }
    static addCustomPlaylistElements(app, html) {
        if (!game.user.isGM) {
            return;
        }
        if (app.options.id == 'playlists') {
            let button = $(`<button><i class='fas fa-border-all'></i> ${game.i18n.localize('SOUNDBOARD.button.openSoundboard')}</button>`);
            button.click(SoundBoard.openSoundBoard);
            let container = $('<div class="header-actions action-buttons flexrow"></div>');
            container.append(button);
            html.find('.directory-header').append(container);
        }
    }
}
Hooks.on('closeSoundBoardApplication', ()=>{if(SoundBoard.openedBoard?.rendered){SoundBoard.openedBoard.close();}});
Hooks.once('ready', SoundBoard.onInit);
Hooks.on('getSceneControlButtons', SoundBoard.addSoundBoard);
Hooks.on('renderSidebarTab', SoundBoard.addCustomPlaylistElements);
