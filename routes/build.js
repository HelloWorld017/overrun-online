var router = require('express').Router;
var errors = require('../src/errors');

var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = erros.NotLoggedInError;
var TooManyBotsError = errors.TooManyBotsError;

router.all((req, res, next) => {
	if(req.method === 'POST'){
		if(!req.locals.auth){
			next(new NotLoggedInError());
			return;
		}

		if(req.body.name === undefined || req.body.skin === undefined || req.body.code === undefined){
			next(new InvalidDataError());
			return;
		}

		if(!/[A-Za-z0-9가-힣ㄱ-ㅎ-+_()]{3,20}/.test(req.body.name){
			next(new InvalidDataError());
			return;
		}

		if(!req.locals.user.skins.inclues(req.body.skin)){
			//TODO update user.skins
			next(new InvalidDataError());
			return;
		}

		if(req.locals.user.bots.length > global.config['max-bot-count']){
			next(new TooManyBotsError());
			return;
		}

		if(req.body.code.length > global.config['max-code-length']){
			next(new TooLongCodeError());
			return;
		}

		var bot = new Bot(req.locals.user, req.body.skin, req.body.name, req.body.code);
		res.redirect('/bots');
		return;
	}

	res.render('build', {
		skin: req.locals.user.skins
	});
});

module.exports = router;
