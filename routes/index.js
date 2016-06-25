var express = require('express');
var git = require('git-rev');
var router = express.Router();

var ServerError = require('../src/errors').ServerError;

router.get('/', (req, res, next) => {
	if(res.locals.auth){
		global.mongo
			.collection(global.config['collection-battle'])
			.find({})
			.limit(20)
			.sort({dateTime: -1})
			.toArray((err, result) => {
				if(err){
					next(new ServerError());
					return;
				}
				result.forEach((v) => {
					v.players
				});
				res.render('index', {
					battles: result
				});
			});
		return;
	}

	if(req.cookies.developer){
		git.short((commitHash) => {
			git.log((commitLog) => {
				res.render('splash', {
					hash: commitHash,
					log: commitLog
				});
			});
		});
		return;
	}

	res.cookie('developer', true).render('developer-splash');
});

module.exports = router;
