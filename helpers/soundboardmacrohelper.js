// eslint-disable-next-line no-unused-vars
class SBMacroHelper {
    //TODO
    // Add more functionality: TargetPlayer, volume, preview

    static async generateMacro(soundName) {
        let macroName = `SoundBoard - ${soundName}`;
        let macroData;

        let existingMacro = game.macros.find((macro) => {
            return macro.name == macroName;
        });
        if (existingMacro) {
            ui.notifications.notify(game.i18n.format('SOUNDBOARD.notif.macroExists', {macro: macroName}));
            macroData = existingMacro;
        } else {
            macroData = await Macro.create({
                name: macroName,
                command: `
SoundBoard.playSoundByName("${soundName}");
// SHIFT CLICK this macro to cache the sound, click to play it`,
                type: 'script',
                img: 'modules/SoundBoard/bundledDocs/sbmacro.png'
            });
            ui.notifications.notify(game.i18n.format('SOUNDBOARD.notif.macroCreated', {macro: macroName}));
        }
        let editingJournals = game.journal.filter((journal) => {
            return journal.sheet.editors?.content?.mce;
        });

        if (editingJournals) {
            for (let journal of editingJournals) {
                journal.sheet.editors.content.mce.insertContent(`@Macro[${macroData.id}]{${macroData.name}}`);
            }
        }
    }

    static async deleteAllMacros() {
        let existingMacros = game.macros.filter(macro =>macro.name.indexOf('SoundBoard - ') == 0).map(macro=>macro.id);
        if(existingMacros.length > 0){
            await Macro.delete(existingMacros);
            ui.notifications.notify(game.i18n.localize('SOUNDBOARD.notif.deleteMacros'));
        } else {
            ui.notifications.notify(game.i18n.localize('SOUNDBOARD.notif.noMacros'));
        }
    }
}