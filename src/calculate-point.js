require('./library');

module.exports = {
    defeat: (winnerPoint, point) => {
        return Math.clamp(5, 100, Math.pow((Math.clamp(-50, 50, point - winnerPoint) + 50) / 10, 2));
    },

    win: (winnerPoint, point) => {
        return Math.clamp(1, 30, Math.round(Math.pow(Math.log(Math.clamp(-49, 50, point - winnerPoint) + 50) * 2, 2) / 3));
    }
};
