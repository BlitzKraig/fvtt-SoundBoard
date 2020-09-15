class SoundBoardFavApplication extends SoundBoardApplication {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `⭐${game.i18n.localize("SOUNDBOARD.app.favTitle")}`;
        options.template = "modules/SoundBoard/templates/soundboard.html";
        return options;
    }
    getData() {
        var sounds = []
        var totalCount = 0;

        Object.keys(SoundBoard.sounds).forEach(key => {
            let favoritedArray = SoundBoard.sounds[key].filter((el)=>el.isFavorite);
            totalCount += favoritedArray.length;
            if (favoritedArray.length > 0) {
                sounds.push({
                    categoryName: this.formatName(key),
                    length: favoritedArray.length,
                    files: favoritedArray.map(element => {
                        element.name = this.formatName(element.name);
                        return element;
                    })
                });
            }
        });

        Object.keys(SoundBoard.bundledSounds).forEach(key => {
            let favoritedArray = SoundBoard.bundledSounds[key].filter((el)=>el.isFavorite);
            totalCount += favoritedArray.length;
            if (favoritedArray.length > 0) {
                sounds.push({
                    categoryName: this.formatName(key),
                    length: favoritedArray.length,
                    files: favoritedArray.map(element => {
                        element.name = this.formatName(element.name);
                        return element;
                    })
                });
            }
        });

        var volume = game.settings.get("SoundBoard", "soundboardServerVolume");
        return {
            tab: {fav:true},
            sounds,
            volume,
            totalCount
        }
    }
}