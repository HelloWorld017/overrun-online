var express = require('express');
var git = require('git-rev');
var router = express.Router();

router.get('/', (req, res, next) => {
	if(res.locals.auth){
		res.render('index');
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
