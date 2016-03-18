var createToken = require('../src/create-token');
var router = require('express').Router();
var errors = require('../src/errors');

var InvalidDataError = errors.InvalidDataError;
var InvalidTokenError = errors.InvalidTokenError;
var NotLoggedInError = erros.NotLoggedInError;
var ServerError = erros.ServerError;
var TooManyBotsError = errors.TooManyBotsError;

router.all('/edit/:id', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(res.locals.user.bots[req.params.id] === undefined){
		next(new InvalidDataError());
		return;
	}

	if(req.method === 'POST'){
		if(req.body.name === undefined || req.body.skin === undefined || req.body.code === undefined || req.body.token === undefined){
			next(new InvalidDataError());
			return;
		}

		if(req.body.token !== req.session.token){
			next(new InvalidTokenError());
			return;
		}

		if(!/[A-Za-z0-9가-힣ㄱ-ㅎ-+_()]{3,20}/.test(req.body.name){
			next(new InvalidDataError());
			return;
		}

		if(!res.locals.user.skins.inclues(req.body.skin)){
			next(new InvalidDataError());
			return;
		}

		if(req.body.code.length > global.config['max-code-length']){
			next(new TooLongCodeError());
			return;
		}

		res.locals.user.bots[req.params.id] = new Bot(res.locals.user, req.body.skin, req.body.name, req.body.code);
		res.locals.user.saveBots();
		return;
	}

	req.session.token = createToken(1024);
	req.session.save((err) => {
		if(err){
			next(new ServerError());
			return;
		}

		res.render('build', {
			skin: res.locals.user.skins,
			bot: res.locals.user.bots[req.params.id],
			token:
		});
	});

});

router.all('/build', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(req.method === 'POST'){
		if(req.body.name === undefined || req.body.skin === undefined || req.body.code === undefined){
			next(new InvalidDataError());
			return;
		}

		if(!/[A-Za-z0-9가-힣ㄱ-ㅎ-+_()]{3,20}/.test(req.body.name){
			next(new InvalidDataError());
			return;
		}

		if(!res.locals.user.skins.inclues(req.body.skin)){
			//TODO update user.skins
			next(new InvalidDataError());
			return;
		}

		if(res.locals.user.bots.length > global.config['max-bot-count']){
			next(new TooManyBotsError());
			return;
		}

		if(req.body.code.length > global.config['max-code-length']){
			next(new TooLongCodeError());
			return;
		}

		res.locals.user.bots.push(new Bot(res.locals.user, req.body.skin, req.body.name, req.body.code));
		res.locals.user.saveBots();
		res.redirect('/battle');
		return;
	}

	res.render('build', {
		skin: res.locals.user.skins,
		bot: undefined
	});
});

module.exports = router;
