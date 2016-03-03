var router = require('express').Router;
var errors = require('../src/errors');

var NotLoggedInError = errors.NotLoggedInError;

router.get('/', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(!res.locals.user.lastGame){
		next(new EntryFirstError());
		return;
	}

	res.json(res.locals.user.lastGame.gameLog);
});
