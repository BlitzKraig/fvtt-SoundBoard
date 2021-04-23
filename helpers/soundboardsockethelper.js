// eslint-disable-next-line no-unused-vars
class SBSocketHelper {
    static socketName = 'module.SoundBoard';
    static SOCKETMESSAGETYPE = {
        PLAY: 1,
        STOP: 2,
        STOPALL: 3,
        CACHE: 4,
        CACHECOMPLETE: 5,
        VOLUMECHANGE: 6,
        REQUESTMACROPLAY: 7
    }
    constructor() {
        game.socket.on(SBSocketHelper.socketName, this._onData);
    }
    _onData(data) {
        if (game.user.isGM) {
            if(data.type === SBSocketHelper.SOCKETMESSAGETYPE.CACHECOMPLETE){
                SoundBoard.audioHelper.cacheComplete(data.payload);
            } else if (data.type == SBSocketHelper.SOCKETMESSAGETYPE.REQUESTMACROPLAY){
                if(game.settings.get('SoundBoard', 'allowPlayersMacroRequest')){
                    SoundBoard.playSoundByName(data.payload);
                }
            }
        } else {
            switch (data.type) {
            case SBSocketHelper.SOCKETMESSAGETYPE.PLAY:
                if (!data.payload.target || data.payload.target == game.userId) {
                    SoundBoard.audioHelper.play(data.payload);
                }
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.STOP:
                SoundBoard.audioHelper.stop(data.payload);
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.STOPALL:
                SoundBoard.audioHelper.stopAll();
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.CACHE:
                SoundBoard.audioHelper.cache(data.payload);
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.VOLUMECHANGE:
                SoundBoard.audioHelper.onVolumeChange(data.payload?.volume);
                break;
            default:
                break;
            }
        }
    }

    sendData(data) {
        game.socket.emit(SBSocketHelper.socketName, data);
    }
}