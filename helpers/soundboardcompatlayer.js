// eslint-disable-next-line no-unused-vars
class SBCompatLayer {

    static getKeyDown(keyCode, alternateKeyCode = undefined) {
        if (Math.floor(game.version) < 10) {
            return keyboard._downKeys.has(keyCode);
        } else {
            return keyboard.downKeys.has(alternateKeyCode ?? keyCode);
        }
    }

    static async deleteMacros(macros) {
        if (Math.floor(game.version) < 10) {
            return await Macro.delete(macros);
        } else {
            return await Macro.deleteDocuments(macros);
        }
    }
}