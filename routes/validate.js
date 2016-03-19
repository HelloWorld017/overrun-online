var router = require('express').Router();

router.post('/id', (req, res, next) => {
	var val = req.body.val;

	if(!val){
		res.send("false");
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({name: val})
		.toArray((err, result) => {
			if(err || result.length >= 1){
				res.send("false");
				return;
			}

			res.send("true");
		});
});

router.post('/email', (req, res, next) => {
	var val = req.body.val;

	if(!val){
		res.send("false");
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({email: val})
		.toArray((err, response) => {
			if(err || response.length >= 1){
				res.send("false");
				return;
			}

			res.send("true");
		});
});

module.exports = router;
