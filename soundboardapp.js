class SoundBoardApplication extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `🔊${game.i18n.localize("SOUNDBOARD.app.title")}`;
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