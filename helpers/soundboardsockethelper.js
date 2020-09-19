class SBSocketHelper {
    static socketName = "module.SoundBoard";
    static SOCKETMESSAGETYPE = {
        PLAY: 1,
        STOP: 2,
        STOPALL: 3
    }
    constructor(isGM) {
        if (!isGM) {
            game.socket.on(SBSocketHelper.socketName, this._onData);
        }
    }
    _onData(data) {
        console.log(data);
        switch (data.type) {
            case SBSocketHelper.SOCKETMESSAGETYPE.PLAY:
                if(!data.payload.target || data.payload.target == game.userId){
                    SoundBoard.audioHelper.play(data.payload);
                }
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.STOP:
                SoundBoard.audioHelper.stop(data.payload);
                break;
            case SBSocketHelper.SOCKETMESSAGETYPE.STOPALL:
                SoundBoard.audioHelper.stopAll();
                break;
            default:
                break;
        }
    }

    sendData(data) {
        game.socket.emit(SBSocketHelper.socketName, data);
    }
}