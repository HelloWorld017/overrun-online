module.exports = {
	name: 'Common Pass',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604290001',
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
		cb();
	}
};
