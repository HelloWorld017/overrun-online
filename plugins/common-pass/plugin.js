module.exports = {
	name: 'Common Pass',
	author: 'Khinenw',
	version: 'alpha 1.0.0 201607170001',
	onLoad: (cb) => {
		global.server.on('player.save', (player) => {
			global.mongo
				.collection(global.config['collection-user'])
				.findOneAndUpdate({
					name: player.name
				}, {
					$set: {
						pass: player.pass
					}
				});
		});

		global.server.on('player.load', (player, data) => {
			player.pass = data.pass || [];
		});

		cb();
	}
};
