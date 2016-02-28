'use strict';

const TICK = 5000;

class MatchMaker{
    constructor(){
        this.pool = {};
        this.intervalId = undefined;
    }

    entry(player, rank){
        if(player.currentGame !== undefined) return;

        this.pool[player.getName()] = player;
    }

    onRun(){

    }

    remove(){
        clearInterval(this.intervalId);
    }
}

MatchMake.newInstance = () => {
    var matchmaker = new MatchMaker();
    matchmaker.intervalId = setInterval(matchmaker.onRun, TICK);
};
