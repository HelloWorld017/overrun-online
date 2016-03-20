var errors = require('../src/errors');
﻿var router = require('express').Router();

var NotLoggedInError = errors.NotLoggedInError;
var ServerError = errors.ServerError;

router.all('/', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	res.locals.logout((err) => {
		if(err){
			console.error(err.message);
			next(new ServerError());
			return;
		}

		res.redirect('/');
	});
});

module.exports = router;
