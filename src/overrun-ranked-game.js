'use strict';
var OverrunGame = require('./ovverun-game');

class OverrunRankedGame extends OverrunGame{
    constructor(gid, bot1, bot2, server){
        super(gid, bot1, bot2, [bot1.player, bot2.player], server);

        this.players.forEach((v) => {
            v.currentGame = this;
        });
    }

    handleWin(gameLog){
        var playerScore = 0;
        var playerName = this.players[0].getName();

        this.server.removeGame(this.gameId);
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
                    p1.point += Math.clamp(1, 30, Math.round(Math.pow(Math.log(Math.clamp(-49, 50, p2.getPoint() - p1.getPoint()) + 50) * 2, 2) / 3));
                    p1.getSocket().emit('game.win');

                    p2.getStat().defeat++;
                    p2.point -= Math.clamp(5, 100, Math.pow((Math.clamp(-50, 50, p2.getPoint() - p1.getPoint()) + 50) / 10, 2));
                    p2.getSocket().emit('game.defeat');
                    return;
                }

                if(playerStatus === 0){
                    p1.getStat().draw++;
                    p1.getSocket().emit('game.draw');

                    p2.getStat().draw++;
                    p2.getSocket().emit('game.draw');
                    return;
                }

                p1.getStat().defeat++;
                p1.point -= Math.clamp(5, 100, Math.pow((Math.clamp(-50, 50, p2.getPoint() - p1.getPoint()) + 50) / 10, 2));
                p1.getSocket().emit('game.defeat');

                p2.getStat().win++;
                p2.point += Math.clamp(1, 30, Math.round(Math.pow(Math.log(Math.clamp(-49, 50, p2.getPoint() - p1.getPoint()) + 50) * 2, 2) / 3));
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

module.exports = OverrunRankedGame;
