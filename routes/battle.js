var router = require('express').Router;
var errors = require('../src/errors');

var AlreadyEntriedError = errors.AlreadyEntriedError;
var EntryFirstError = errors.EntryFirstError;
var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = errors.NotLoggedInError;

router.post('/entry/:bot', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(res.locals.user.currentGame){
		next(new AlreadyEntriedError());
		return;
	}

	if(req.method === 'POST'){
		if(res.locals.user.bots[req.params.bot] === undefined){
			next(new InvalidDataError());
			return;
		}

		global.server.matchmaker.entry(res.locals.user, res.locals.user.bots[req.params.bot]);
		res.render('in-entry');
		return;
	}

	res.render('entry');
});

router.get('/result', (req, res, next) => {
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
