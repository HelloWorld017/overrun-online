var router = require('express').Router();

var Library = require('../src/library');
var ServerError = require('../src/errors').ServerError;

const MAX_VISIBLE_RANKING = 500;
router.get('/:page?', (req, res, next) => {
	var showAmount = Math.clamp(5, 50, req.query.showAmount || 20);
	var page = Math.clamp(1, Math.ceil(MAX_VISIBLE_RANKING / showAmount), parseInt(req.params.page || '1'));

	if(!isFinite(page)) page = 1;

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
