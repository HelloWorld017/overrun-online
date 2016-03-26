var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
	if(res.locals.auth){
		res.render('index');
		return;
	}

	if(req.cookies.developer){
		res.render('splash');
		return;
	}

	res.cookie('developer', true).render('developer-splash');
});

module.exports = router;
