// eslint-disable-next-line no-unused-vars
class SoundBoardFavApplication extends SoundBoardApplication {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `⭐${game.i18n.localize('SOUNDBOARD.app.favTitle')}`;
        options.template = 'modules/SoundBoard/templates/soundboard.html';
        return options;
    }
    getData() {
        var sounds = [];
        var totalCount = 0;

        Object.keys(SoundBoard.sounds).forEach(key => {
            let favoritedArray = SoundBoard.sounds[key].filter((el)=>el.isFavorite);
            totalCount += favoritedArray.length;
            if (favoritedArray.length > 0) {
                sounds.push({
                    categoryName: key,
                    length: favoritedArray.length,
                    files: favoritedArray
                });
            }
        });

        Object.keys(SoundBoard.bundledSounds).forEach(key => {
            let favoritedArray = SoundBoard.bundledSounds[key].filter((el)=>el.isFavorite);
            totalCount += favoritedArray.length;
            if (favoritedArray.length > 0) {
                sounds.push({
                    categoryName: key,
                    length: favoritedArray.length,
                    files: favoritedArray
                });
            }
        });

        var volume = game.settings.get('SoundBoard', 'soundboardServerVolume');
        var players = game.users.entities.filter((el)=>el.active && !el.isGM).map((el)=>{return {name: el.name, id: el.id, isTarget:el.id==SoundBoard.targettedPlayerID?true:false};});
        var targettedPlayer = SoundBoard.targettedPlayerID;
        var cacheMode = SoundBoard.cacheMode;
        var macroMode = SoundBoard.macroMode;
        return {
            tab: {fav:true},
            sounds,
            volume,
            totalCount,
            players,
            targettedPlayer,
            cacheMode,
            macroMode
        };
    }
}