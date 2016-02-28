'use strict';
var OverrunGame = require('./ovverun-game');

class OverrunRankedGame extends OverrunGame{
    constructor(p1, p2, bot1, bot2){
        super(bot1, bot2, [p1, p2]);
    }

    handleWin(gameLog){
        var playerScore = 0;
        var playerName = this.players[0].getName();

        async.each(gameLog, (v, cb) => {
            if(v.final.data.player === playerName){
                playerScore++;
                cb();
                return;
            }

            playerScore--;
            cb();
        }, (err) => {
            getPlayerByName(playerName, (p1) => {
                var p2 = this.players.filter((v) => {
                    return v.getName() !== playerName;
                });

                if(playerStatus > 0){
                    p1.getStat().win++;
                    p1.getSocket().emit('game.win');

                    p2.getStat().defeat++;
                    p2.getSocket().emit('game.defeat');
                    return;
                }

                if(playerStatus === 0){
                    p1.getStatus().draw++;
                    p1.getSocket().emit('game.draw');

                    p2.getStatus().draw++;
                    p2.getSocket().emit('game.draw');
                    return;
                }

                p1.getStatus().defeat++;
                p1.getSocket().emit('game.defeat');

                p2.getSocket().win++;
                p2.getSocket().emit('game.win');
            });
        });
    }

    getPlayerByName(name, callback){
        async.each(this.players, (v, cb) => {
            if(v.getName() === name){
                cb(v);
            }
        }, (player) => {
            callback(player);
        });
    }
}
