var router = require('express').Router();

var ServerError = require('../src/errors').ServerError;

router.get('/', (req, res, next) => {
	var page = Math.max(1, parseInt(req.query.page || 1));
	if(!isFinite(page) || page === null) page = 1;

	var collection = global.mongo
		.collection(global.config['collection-user'])
		.find({});

	collection
		.sort({point: -1})
		.skip((page - 1) * showAmount)
		.limit(showAmount)
		.toArray((err, arr) => {
		if(err){
			console.error(err);
			next(new ServerError());
			return;
		}

		collection.count(false, (err, count) => {
			if(err){
				console.error(err);
				next(new ServerError());
				return;
			}

			res.render('rank', {
				rankers: arr,
				count: Math.floor(count / showAmount)
			});
		});
	});
});

module.exports = router;
