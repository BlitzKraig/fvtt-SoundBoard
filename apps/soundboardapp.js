class SoundBoardApplication extends Application {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `🔊${game.i18n.localize("SOUNDBOARD.app.title")}`;
        options.id = "soundboard-app";
        options.template = "modules/SoundBoard/templates/soundboard.html";
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
            $.get("modules/SoundBoard/templates/extendedoptions.html", function(data){
                data = data.replace(/\$identifyingPath/g, identifyingPath);
                data = data.replace('$loopClass', isLooping?'loop-active':'')
                data = data.replace('$loopFn', isLooping?'stopLoop':'startLoop');
                data = data.replace('$star', isFavorite?'fas fa-star':'far fa-star');
                data = data.replace('$favoriteFn', isFavorite?'unfavoriteSound':'favoriteSound');
                data = data.replace(/\$delayValue/g, delayValue);
                data = data.replace('$delayClass', delayValue==0?'hidden':'')
                if(favTab){
                    data = data.replace('$removeFavFn', '$(this).parent().parent().parent().remove();');
                } else {
                    data = data.replace('$removeFavFn', '');
                }
                $(element).parent().append(data);
            });
        }
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
        var collapse = totalCount > 2000;
        // TODO: Subclass mySounds, set up getData with supers
        var players = game.users.entities.filter((el)=>el.active && !el.isGM).map((el)=>{return {name: el.name, id: el.id, isTarget:el.id==SoundBoard.targettedPlayerID?true:false};});
        var targettedPlayer = SoundBoard.targettedPlayerID;
        return {
            tab: {
                main:true
            },
            sounds,
            volume,
            totalCount,
            collapse,
            players,
            targettedPlayer
        }
    }
}