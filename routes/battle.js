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

router.post('/entry/:game/:bot/:argument', (req, res, next) => {
	if(res.locals.user.currentGame){
		next(new AlreadyEntriedError());
		return;
	}

	var bot = res.locals.user.bots[parseInt(req.params.bot)];
	if(!bot){
		next(new InvalidDataError());
		return;
	}

	if(bot.type !== game){
		next(new InvalidDataError());
		return;
	}

	var game = req.params.game.replace(/[^A-Z0-9-]/g, '');
	if(global.server.matchmakers[game] === undefined){
		next(new InvalidDataError());
		return;
	}

	global.server.matchmakers[game].entry(res.locals.user, bot, req.params.argument);
	res.render('in-entry');
	return;
});

router.get('/result/:id', (req, res, next) => {

	global.mongo
		.collection(global.config['collection-battle'])
		.find({id: req.params.id})
		.toArray((err, battle) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(battle.length <= 0){
				var error = new Error('Not Found');
				error.status = 404;

				next(error);
				return;
			}

			res.json(battle[0]);
		});
});

module.exports = router;
