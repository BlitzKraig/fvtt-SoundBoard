class SBSoundPack {
    constructor(packName, packDir, moduleName, {licenses, description, link, author} = {}){
        this.name = packName;
        this.dir = packDir;
        this.moduleName = moduleName;
        this.licenses = licenses || [];

        for(let license of this.licenses){
            if(!license.licenseDescription){
                license.licenseDescription = '';
            }
            if(license.licenseUrl && !license.licenseType){
                license.licenseType = game.i18n.localize('SOUNDBOARD.app.packman.package.licenseUnknown');
            }
        }
        
        this.description = description || '';
        this.author = author || '';
        this.link = link || '';
        this.disabled = SoundBoard.packageManager.disabledArray.includes(packName);
    }

    get disabled() {
        SoundBoard.log(`${this.name} disabled: ${this._disabled}`);
        return this._disabled;
    }
    
    set disabled(disabled){
        SoundBoard.log(`${this.name} setting disabled state: ${disabled}`);
        this._disabled = disabled;
    }
}
// eslint-disable-next-line no-unused-vars
class SBPackageManager {
    constructor() {
        this._soundPacks = [];

        game.settings.register('SoundBoard', 'disabledPacks',
            {
                scope: 'world',
                config: false,
                default: []
            });
        this.disabledArray = game.settings.get('SoundBoard', 'disabledPacks');
    }
    
    get soundPacks(){
        return this._soundPacks;
    }
    set soundPacks(soundPacks) {
        this._soundPacks = soundPacks;
    }

    addSoundPack(packName, packDir, moduleName, {licenses, description, link, author} = {}) {
        if(!packName || !packDir || !moduleName){
            return 'Missing required arguments';
        }
        if(licenses && !Array.isArray(licenses)){
            return 'licenses should be an array of license objects';
        }
        this.soundPacks.push(new SBSoundPack(packName, packDir, moduleName, {licenses, description, author, link}));
    }

    alphabetizePacks() {
        this.soundPacks.sort(function(a,b){
            return a.name.localeCompare(b.name);
        });
    }

    clearSoundPacks() {
        delete this.soundPacks;
        this.soundPacks = [];
    }

    //TODO Add ID and use a better data structure
    disableSoundPack(packName) {
        let pack = this.soundPacks.find(pack=>pack.name === packName);
        if(pack){
            pack.disabled = true;
            this.disabledArray.push(packName);
            game.settings.set('SoundBoard', 'disabledPacks', this.disabledArray);
            SoundBoard.refreshSounds({notify: false, bringToTop: false});
        }
    }
    enableSoundPack(packName) {
        let pack = this.soundPacks.find(pack=>pack.name === packName);
        if(pack){
            pack.disabled = false;
            this.disabledArray = this.disabledArray.filter(e => e !== packName);
            game.settings.set('SoundBoard', 'disabledPacks', this.disabledArray);
            SoundBoard.refreshSounds({notify: false, bringToTop: false});
        }
    }

    toggleSoundPack(packName, html) {
        let pack = this.soundPacks.find(pack=>pack.name === packName);
        if(pack){
            pack.disabled = !pack.disabled;
            if(pack.disabled){
                this.disabledArray.push(packName);
                if(html){
                    $(html).removeClass('active');
                }
            } else {
                this.disabledArray = this.disabledArray.filter(e => e !== packName);
                if(html){
                    $(html).addClass('active');
                }
            }
            game.settings.set('SoundBoard', 'disabledPacks', this.disabledArray);
            
            SoundBoard.refreshSounds({notify: false, bringToTop: false});
        }
    }
}