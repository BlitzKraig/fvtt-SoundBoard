// eslint-disable-next-line no-unused-vars
class SoundBoardApplication extends Application {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `🔊${game.i18n.localize('SOUNDBOARD.app.title')}`;
        options.id = 'soundboard-app';
        options.template = 'modules/SoundBoard/templates/soundboard.html';
        // options.width = 700;
        options.resizable = true;
        return options;
        // TODO: Look into TabsV2 impl.
    }


    static toggleExtendedOptions(element, identifyingPath, favTab) {
        if(!identifyingPath){
            // Nasty... Fix this soon
            if($(element).parent().parent().parent().find('.sb-extended-option-container').length > 0) {
                $(element).parent().parent().parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
                return;
            }
            if($(element).parent().parent().parent().parent().find('.sb-extended-option-container').length > 0) {
                $(element).parent().parent().parent().parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
                return;
            }
            if($(element).parent().parent().parent().parent().parent().find('.sb-extended-option-container').length > 0) {
                $(element).parent().parent().parent().parent().parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
                return;
            }
            return;
        }
        if($(element).parent().find('.sb-extended-option-container').length > 0) {
            $(element).parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
        } else {
            let sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
            let isFavorite = sound.isFavorite;
            let isLooping = sound.isLoop;
            let delayValue = sound.loopDelay || 0;
            $.get('modules/SoundBoard/templates/extendedoptions.html', function(data){
                data = data.replace(/\$identifyingPath/g, identifyingPath);
                data = data.replace('$loopClass', isLooping?'loop-active':'');
                data = data.replace('$loopFn', isLooping?'stopLoop':'startLoop');
                data = data.replace('$star', isFavorite?'fas fa-star':'far fa-star');
                data = data.replace('$favoriteFn', isFavorite?'unfavoriteSound':'favoriteSound');
                data = data.replace(/\$delayValue/g, delayValue);
                data = data.replace('$delayClass', delayValue==0?'hidden':'');
                if(favTab){
                    data = data.replace('$removeFavFn', '$(this).parent().parent().parent().remove();');
                } else {
                    data = data.replace('$removeFavFn', '');
                }
                $(element).parent().append(data);
            });
        }
    }
    
    async render(force = false, options = {}) {
        await super.render(force, options);

        let renderedInterval = setInterval(() => {
            if (this.rendered) {
                setTimeout(() => {
                    $('#soundboard-app').css('opacity', game.settings.get('SoundBoard', 'opacity'));
                    clearInterval(renderedInterval);
                    renderedInterval = undefined;
                }, 100);
            }
        }, 50);
    }

    getData() {
        var sounds = [];
        var totalCount = 0;

        Object.keys(SoundBoard.sounds).forEach(key => {
            totalCount += SoundBoard.sounds[key].length;
            if (SoundBoard.sounds[key].length > 0) {
                sounds.push({
                    categoryName: key,
                    length: SoundBoard.sounds[key].length,
                    files: SoundBoard.sounds[key]
                });
            }
        });
        var volume = game.settings.get('SoundBoard', 'soundboardServerVolume');
        var collapse = totalCount > 2000;
        // TODO: Subclass mySounds, set up getData with supers
        var players = game.users.entities.filter((el)=>el.active && !el.isGM).map((el)=>{return {name: el.name, id: el.id, isTarget:el.id==SoundBoard.targettedPlayerID?true:false};});
        var targettedPlayer = SoundBoard.targettedPlayerID;
        var cacheMode = SoundBoard.cacheMode;
        var macroMode = SoundBoard.macroMode;
        var isExampleAudio = game.settings.get('SoundBoard', 'soundboardDirectory') == game.settings.settings.get('SoundBoard.soundboardDirectory').default;

        return {
            tab: {
                main:true
            },
            sounds,
            volume,
            totalCount,
            collapse,
            players,
            targettedPlayer,
            cacheMode,
            macroMode,
            isExampleAudio
        };
    }
}