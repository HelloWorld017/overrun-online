var router = require('express').Router();
var errors = require('../src/errors');

var AlreadyEntriedError = errors.AlreadyEntriedError;
var EntryFirstError = errors.EntryFirstError;
var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = errors.NotLoggedInError;

router.use((req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	next();
});

router.get('/entry', (req, res, next) => {
	if(res.locals.user.currentGame){
		next(new AlreadyEntriedError());
		return;
	}

	res.render('entry');
});

router.post('/entry/:game/:bot', (req, res, next) => {
	if(res.locals.user.currentGame){
		next(new AlreadyEntriedError());
		return;
	}

	if(res.locals.user.bots[req.params.bot] === undefined){
		next(new InvalidDataError());
		return;
	}

	var game = req.params.game.replace(/[^A-Z0-9-]/g, '');
	if(global.server.matchmakers[game] === undefined){
		next(new InvalidDataError());
		return;
	}

	global.server.matchmakers[game].entry(res.locals.user, res.locals.user.bots[req.params.bot]);
	res.render('in-entry');
	return;
});

router.get('/result', (req, res, next) => {

	if(!res.locals.user.lastGame){
		next(new EntryFirstError());
		return;
	}

	res.json(res.locals.user.lastGame.gameLog);
});

module.exports = router;
