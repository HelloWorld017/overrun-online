var router = require('express').Router();

router.get('/', (req, res next) => {
	var collection = global.mongo
		.collection(global.config['collection-user'])
		.find({})
		.sort({
			point: 1
		});
	
	
});

module.exports = router;

