var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
	if(res.locals.auth){
		res.render('index');
		return;
	}

	res.render('splash');
});

module.exports = router;
