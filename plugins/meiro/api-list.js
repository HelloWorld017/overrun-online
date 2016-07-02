module.exports = {
	title: global.translator('plugin.meiro.api.title'),
	content: ['rule', 'log', 'turnLeft', 'turnRight', 'move', 'carveWall', 'x', 'y', 'direction', 'checkWall', 'save', 'load', 'items', 'objects', 'moveResult'].map((v) => {
		return {
			title: global.translator(`plugin.meiro.api.${v}.title`),
			content: global.translator(`plugin.meiro.api.${v}.content`)
		};
	})
};
