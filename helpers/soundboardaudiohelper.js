// eslint-disable-next-line no-unused-vars
class SBAudioHelper {

    activeSounds = [];
    constructor() {}

    delayIntervals = {
        intervals: new Set(),
        make(callback, time) {
            var newInterval = setInterval(callback, time);
            this.intervals.add(newInterval);
            return newInterval;
        },

        // clear a single interval
        clear(id) {
            this.intervals.delete(id);
            return clearInterval(id);
        },

        // clear all intervals
        clearAll() {
            for (var id of this.intervals) {
                this.clear(id);
            }
        }
    };

    //0.8.1+ goodies
    static hasHowler(){
        return typeof Howl != 'undefined';
    }
    detuneNode(soundNode, detuneBy){
        if(detuneBy == 0){
            return;
        }
        
        if(SBAudioHelper.hasHowler()){
            soundNode.rate(detuneBy);
        } else {
            soundNode.node.detune.value = detuneBy;
        }
    }
    lowpassFilter(){
        let lowPassCoefs = [
            {
                frequency: 200,
                feedforward: [0.00020298, 0.0004059599, 0.00020298],
                feedback: [1.0126964558, -1.9991880801, 0.9873035442]
            },
            {
                frequency: 500,
                feedforward: [0.0012681742, 0.0025363483, 0.0012681742],
                feedback: [1.0317185917, -1.9949273033, 0.9682814083]
            },
            {
                frequency: 1000,
                feedforward: [0.0050662636, 0.0101325272, 0.0050662636],
                feedback: [1.0632762845, -1.9797349456, 0.9367237155]
            },
            {
                frequency: 5000,
                feedforward: [0.1215955842, 0.2431911684, 0.1215955842],
                feedback: [1.2912769759, -1.5136176632, 0.7087230241]
            }
        ];

        let feedForward = lowPassCoefs[SBAudioHelper.filterNumber].feedforward,
            feedBack = lowPassCoefs[SBAudioHelper.filterNumber].feedback;

        // eslint-disable-next-line no-unused-vars
        const iirfilter = game.audio.context.createIIRFilter(feedForward, feedBack);
    }

    async play({
        src,
        volume,
        detune
    }, sound) {
        if (game.settings.get('core', 'globalInterfaceVolume') == 0) {
            ui.notifications.warn(game.i18n.localize('SOUNDBOARD.notif.interfaceMuted'));
        }
        volume *= game.settings.get('core', 'globalInterfaceVolume');

        if (!SBAudioHelper.hasHowler()) {
            var soundNode = new SoundNode(src);
            soundNode.on('end', (id)=>{
                this.removeActiveSound(id);
                if (sound?.isLoop) {
                    if (!sound?.loopDelay || sound?.loopDelay == 0) {
                        SoundBoard.playSound(sound.identifyingPath, true);
                    } else {
                        let interval = this.delayIntervals.make(() => {
                            SoundBoard.playSound(sound.identifyingPath, true);
                            this.delayIntervals.clear(interval);
                        }, sound.loopDelay * 1000);
                    }
                }
            });
            soundNode.on('stop', ()=>{
                if (sound?.isLoop) {
                    sound.isLoop = false;
                }
            });
            soundNode.on('start', ()=>{
                this.detuneNode(soundNode, detune);
            
                soundNode.node.disconnect();
                // soundNode.node.connect(iirfilter).connect(AudioHelper.soundboardGain);
                soundNode.node.connect(game.audio.soundboardGain);
    
                this.activeSounds.push(soundNode);
            });
            if(!soundNode.loaded){
                await soundNode.load();
            }

            if(!game.audio.soundboardGain){
                game.audio.soundboardGain = game.audio.context.createGain();
                game.audio.soundboardGain.connect(game.audio.context.destination);
            }
            game.audio.soundboardGain.gain.value = volume;
            soundNode.play({volume});
        } else {
            let sbhowl = new Howl({
                src,
                volume,
                onend: (id) => {
                    this.removeActiveSound(id);
                    if (sound?.isLoop) {
                        if (!sound?.loopDelay || sound?.loopDelay == 0) {
                            SoundBoard.playSound(sound.identifyingPath, true);
                        } else {
                            let interval = this.delayIntervals.make(() => {
                                SoundBoard.playSound(sound.identifyingPath, true);
                                this.delayIntervals.clear(interval);
                            }, sound.loopDelay * 1000);
                        }
                    }
                },
                onstop: (id) => {
                    if (sound?.isLoop) {
                        sound.isLoop = false;
                    }
                    this.removeActiveSound(id);
                }
            });

            if (!Howler.soundboardGain) {
                Howler.soundboardGain = Howler.ctx.createGain();
                Howler.soundboardGain.connect(Howler.ctx.destination);
            }

            sbhowl._sounds[0]._node.disconnect();
            sbhowl._sounds[0]._node.connect(Howler.soundboardGain);
            this.detuneNode(sbhowl, detune);
            sbhowl.play();
            this.activeSounds.push(sbhowl);
        }
    }

    async cache({
        src,
        volume
    }) {
        if (!SBAudioHelper.hasHowler()) {
            var soundNode = new SoundNode(src);
            await soundNode.load();
            let player = game.user.name;
            SoundBoard.socketHelper.sendData({
                type: SBSocketHelper.SOCKETMESSAGETYPE.CACHECOMPLETE,
                payload: {
                    src,
                    volume,
                    player
                }
            });

        } else {
            new Howl({
                src,
                volume,
                onload: () => {
                    let player = game.user.name;
                    SoundBoard.socketHelper.sendData({
                        type: SBSocketHelper.SOCKETMESSAGETYPE.CACHECOMPLETE,
                        payload: {
                            src,
                            volume,
                            player
                        }
                    });
                }
            });
        }
    }

    cacheComplete({
        src,
        // eslint-disable-next-line no-unused-vars
        volume,
        player
    }) {
        ui.notifications.notify(`${player} cache complete for ${src}`);
    }

    stop(soundObj) {
        if(SBAudioHelper.hasHowler()){
            this.activeSounds.filter(sound => {
                return soundObj.src.includes(sound._src);
            }).forEach(sound => {
                sound.stop();
            });
        } else {
            this.activeSounds.filter(sound => {
                return soundObj.src.includes(sound.src);
            }).forEach(sound => {
                sound.stop();
                this.removeActiveSound(sound);
            });
        }
    }

    stopAll() {
        for (let sound of this.activeSounds){
            sound.stop();
        }
        this.activeSounds = [];
    }

    getActiveSounds() {
        return this.activeSounds;
    }

    removeActiveSound(id) {
        let soundIndex;
        if (!SBAudioHelper.hasHowler()) {
            soundIndex = this.activeSounds.findIndex((element) => {
                return element.id == id.id;
            });
        } else {
            soundIndex = this.activeSounds.findIndex((element) => {
                return element._getSoundIds()[0] == id;
            });
        }
        if (soundIndex > -1) {
            this.activeSounds.splice(soundIndex, 1);
        }
    }

    onVolumeChange(volume) {
        volume *= game.settings.get('core', 'globalInterfaceVolume');
        this.activeSounds.forEach(sound => {
            if(SBAudioHelper.hasHowler()){
                sound.volume(volume);
            } else {
                sound._adjust({volume});
                game.audio.soundboardGain.gain.value = volume;
            }
        });
    }

}