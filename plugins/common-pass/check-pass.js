module.exports = (gameName) => {
	return (player) => {
		return (player.pass !== undefined) && (player.pass.indexOf(gameName) !== -1);
	};
};
