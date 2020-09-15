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
            // Nasty... There must be a better way to do this
            if($(element).parent().parent().parent().find('.sb-extended-option-container').length > 0) {
                $(element).parent().parent().parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
            }
            return;
        }
        if($(element).parent().find('.sb-extended-option-container').length > 0) {
            $(element).parent().find('.sb-extended-option-container').fadeOut(300, function() { $(this).remove(); });
        } else {
            // Get isFavorite from identifyingPath, set favorite icon and behaviour based on this
            // let data = `<div class="sb-extended-option-container">
            // <div class="sb-extended-options row no-gutters active">
            // <button class="sb-fav-button sb-extended-info-button col" onclick="SoundBoard.favoriteSound('${identifyingPath}')"><i class="far fa-star"></i></button>
            // <button class="sb-repeat-button sb-extended-info-button col"><i class="fas fa-sync-alt"></i></button>
            // <button class="sb-repeatdelay-button sb-extended-info-button col"><i class="fas fa-history"></i></button>
            // </div>
            // </div>`
            // $(element).parent().append(data);
            let isFavorite = SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isFavorite;
            let isLooping = SoundBoard.getSoundFromIdentifyingPath(identifyingPath).isLooping;
            $.get("modules/SoundBoard/templates/extendedoptions.html", function(data){
                data = data.replace(/\$identifyingPath/g, identifyingPath);
                data = data.replace('$star', isFavorite?'fas fa-star':'far fa-star');
                data = data.replace('$favoriteFn', isFavorite?'unfavoriteSound':'favoriteSound');
                data = data.replace('$loopFn', isLooping?'stopLoop':'startLoop');
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
        return {
            tab: {
                main:true
            },
            sounds,
            volume,
            totalCount,
            collapse
        }
    }
}