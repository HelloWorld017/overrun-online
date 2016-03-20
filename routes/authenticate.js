var errors = require('../src/errors');
var router = require('express').Router();

var InvalidTokenError = errors.InvalidTokenError;
var ServerError = errors.ServerError;

router.all('/:token/', (req, res, next) => {
	global.mongo
		.collection(global.config['collection-auth'])
		.find({authToken: req.params.token})
		.toArray((err, arr) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(arr.length <= 0){
				next(new InvalidTokenError());
				return;
			}

			global.mongo
				.collection(global.config['collection-user'])
				.findOneAndUpdate({name: arr[0].id}, {
					$set: {
						emailVerified: true
					}
				}).then(() => {
					global.mongo
						.collection(global.config['collection-auth'])
						.remove({authToken: req.params.token});

						res.render('authenticate-finish');
				});
		});
});

module.exports = router;
