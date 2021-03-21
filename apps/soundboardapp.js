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

    formatFilename(name, formatted){
        if(formatted){
            return [name, formatted];
        }
        if(name.indexOf('.') > -1 && name.indexOf('.') < name.length){
            name = name.substr(0, name.lastIndexOf('.'))
        }
        return this.formatName(name, this.formatted);
        
    }
    formatName(name, formatted) {
        if(formatted){
            return [name, formatted];
        }
        try {
            name = decodeURIComponent(name);
            
            // Turn _ and - into spaces. Allow multiple characters to display
            name = name.replace(/_(?! )|-(?! )/g, ' ');

            // Handle camelCase
            name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
            // Add a space before numbers after letters
            name = name.replace(/([a-zA-Z])([0-9])/g, '$1 $2');

            // Uppercase letters after a space
            name = name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            // name = name.replace(/\s\s+/g, ' ');
        } catch (e) {
            console.log(e);
            console.log('Returning simple split name');
        }
        return [name, true];
    }
    getData() {
        var sounds = []
        var totalCount = 0;

        Object.keys(SoundBoard.sounds).forEach(key => {
            totalCount += SoundBoard.sounds[key].length;
            if (SoundBoard.sounds[key].length > 0) {
                let [categoryName, categoryFormatted] = this.formatName(key, false);
                sounds.push({
                    categoryName: categoryName,
                    length: SoundBoard.sounds[key].length,
                    files: SoundBoard.sounds[key].map(element => {
                        [element.name, element.formatted] = this.formatFilename(element.name, element.formatted);
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
        var cacheMode = SoundBoard.cacheMode;
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
            cacheMode
        }
    }
}