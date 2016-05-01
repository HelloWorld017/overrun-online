var crypto = require('crypto');
var router = require('express').Router();

var Library = require('../src/library');
var ServerError = require('../src/errors').ServerError;

const MAX_VISIBLE_RANKING = 500;
router.get('/:page?', (req, res, next) => {
	var showAmount = Math.clamp(5, 50, parseInt(req.query.showAmount || 20));

	var page = Math.clamp(1, Math.ceil(MAX_VISIBLE_RANKING / showAmount), parseInt(req.params.page || 1));

	if(!isFinite(showAmount)) showAmount = 20;
	if(!isFinite(page)) page = 1;

	var collection = global.mongo
		.collection(global.config['collection-user'])
		.find({});

	collection.count(false, (err, count) => {
		if(err){
			console.error(err);
			next(new ServerError());
			return;
		}

		var pageCount = Math.ceil(count / showAmount);
		page = Math.min(pageCount, page);

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

				res.render('rank', {
					rankers: arr.map((v) => {
						return {
							name: v.name,
							emailHash :crypto.createHash('md5').update(v.email.toLowerCase()).digest('hex'),
							point: v.point
						};
					}),
					count: pageCount,
					current: page
				});
			});
	});
});

module.exports = router;
