// class SBAudioHelper extends AudioHelper {
class SBAudioHelper {

    activeSounds = [];
    constructor() {

    }

    delayIntervals = {
        intervals : new Set(),
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
    }

    play({src, volume}, sound) {
        volume *= game.settings.get("core", "globalInterfaceVolume");
        let sbhowl = new Howl({src, volume, onend: (id)=>{
            this.removeActiveSound(id)
            if(sound?.isLoop){
                if(!sound?.loopDelay || sound?.loopDelay == 0){
                    SoundBoard.playSound(sound.identifyingPath, true);
                } else {
                    let interval = this.delayIntervals.make(() => {
                        SoundBoard.playSound(sound.identifyingPath, true);
                        this.delayIntervals.clear(interval);
                    }, sound.loopDelay * 1000);
                }
            }
        },
        onstop: (id)=>{
            if(sound?.isLoop){
                sound.isLoop = false;
            }
            this.removeActiveSound(id)
        }});
        sbhowl.play();
        this.activeSounds.push(sbhowl);
    }

    stop() {
        SoundBoard.log("Not yet implemented");
    }

    stopAll() {
        this.activeSounds.forEach(sound => {
            // Howl.stop(sound);
            sound.stop();
        });
    }

    getActiveSounds() {
        return this.activeSounds;
    }

    removeActiveSound(id) {
        let soundIndex = this.activeSounds.findIndex((element)=>{
            return element._getSoundIds()[0] == id
        });
        if (soundIndex > -1) {
            this.activeSounds.splice(soundIndex, 1);
        }
    }
    
}