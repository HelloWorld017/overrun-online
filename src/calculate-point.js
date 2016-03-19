require('./library');

module.exports = {
	defeat: (winnerPoint, point) => {
		return Math.clamp(5, 100, Math.pow((Math.clamp(-50, 50, point - winnerPoint) + 50) / 10, 2));
	},

	win: (winnerPoint, point) => {
		return Math.clamp(1, 30, Math.round(Math.pow(Math.log(Math.clamp(-49, 50, point - winnerPoint) + 50) * 2, 2) / 3));
	},

	defeatMoney: (point) => {
		return Math.clamp(20, 5000, 20 + Math.round(Math.log(point / 2) * 10));
	},

	winMoney: (winnerPoint) => {
		return Math.clamp(100, 5000, 100 + Math.round(Math.log(winnerPoint) * 10));
	}
};
