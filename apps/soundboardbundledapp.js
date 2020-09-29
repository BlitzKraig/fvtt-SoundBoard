class SoundBoardBundledApplication extends SoundBoardApplication {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `📦${game.i18n.localize("SOUNDBOARD.app.bundledTitle")}`;
        options.template = "modules/SoundBoard/templates/soundboard.html";
        return options;
    }
    getData() {
        var sounds = []
        var totalCount = 0;

        Object.keys(SoundBoard.bundledSounds).forEach(key => {
            totalCount += SoundBoard.bundledSounds[key].length;
            if (SoundBoard.bundledSounds[key].length > 0) {
                sounds.push({
                    categoryName: this.formatName(key),
                    length: SoundBoard.bundledSounds[key].length,
                    files: SoundBoard.bundledSounds[key].map(element => {
                        element.name = this.formatName(element.name);
                        return element;
                    })
                });
            }
        });
        var volume = game.settings.get("SoundBoard", "soundboardServerVolume");
        var players = game.users.entities.filter((el)=>el.active && !el.isGM).map((el)=>{return {name: el.name, id: el.id, isTarget:el.id==SoundBoard.targettedPlayerID?true:false};});
        var targettedPlayer = SoundBoard.targettedPlayerID;
        var cacheMode = SoundBoard.cacheMode;
       return {
            tab: {bundled:true},
            sounds,
            volume,
            totalCount,
            players,
            targettedPlayer,
            cacheMode
        }
    }
}