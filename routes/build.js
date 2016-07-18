var Bot = require('../src/bot');
var createToken = require('../src/create-token');
var router = require('express').Router();
var errors = require('../src/errors');

var InvalidDataError = errors.InvalidDataError;
var InvalidTokenError = errors.InvalidTokenError;
var NotLoggedInError = errors.NotLoggedInError;
var ServerError = errors.ServerError;
var TooManyBotsError = errors.TooManyBotsError;

var testVal = (req, res) => {
	if(req.body.name === undefined || req.body.skin === undefined || req.body.code === undefined || req.body.type === undefined){
		return (new InvalidDataError());
	}

	if(!/[A-Za-z0-9가-힣ㄱ-ㅎ-+_()]{3,20}/.test(req.body.name)){
		return (new InvalidDataError());
	}

	if(res.locals.user.skins.indexOf(req.body.skin) === -1){
		return (new InvalidDataError());
	}

	if(global.server.gamePool[req.body.type] === undefined){
		return (new InvalidDataError());
	}

	if(req.body.code.length > global.config['max-code-length']){
		return (new TooLongCodeError());
	}

	req.body.playable = req.body.playable ? true : false;

	return undefined;
};

router.all('/edit/:id', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(!/^[0-9]+$/.test(req.params.id)){
		next(new InvalidDataError());
		return;
	}

	req.params.id = parseInt(req.params.id);

	if(res.locals.user.bots[req.params.id] === undefined){
		next(new InvalidDataError());
		return;
	}

	if(req.method === 'POST'){
		if(req.body.token === undefined){
			next(new InvalidTokenError());
			return;
		}

		if(req.body.token !== req.session.csrftoken){
			next(new InvalidTokenError());
			return;
		}

		var tested = testVal(req, res);
		if(tested !== undefined){
			next(tested);
			return;
		}

		res.locals.user.bots[req.params.id] = new Bot(res.locals.user, req.body.skin, req.body.name, req.body.code, req.body.type, req.body.playable);
		res.locals.user.saveBots();
		if(req.xhr){
			res.json({
				id: req.params.id
			});
			return;
		}
		res.redirect('/me');
		return;
	}

	var token = createToken(1024);
	req.session.csrftoken = token;
	req.session.save((err) => {
		if(err){
			next(new ServerError());
			return;
		}

		res.render('build', {
			skin: res.locals.user.skins,
			bot: res.locals.user.bots[req.params.id],
			token: token,
			target: '/edit/' + req.params.id,
			games: global.server.gamePool,
			blockly: global.blockly
		});
	});
});

router.all('/', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(req.method === 'POST'){
		var tested = testVal(req, res);
		if(tested !== undefined){
			next(tested);
			return;
		}

		if(res.locals.user.bots.length > global.config['max-bot-count']){
			next(new TooManyBotsError());
			return;
		}

		res.locals.user.bots.push(new Bot(res.locals.user, req.body.skin, req.body.name, req.body.code, req.body.type, req.body.playable));
		res.locals.user.saveBots();
		if(req.xhr){
			res.json({
				id: res.locals.user.bots.length - 1
			});
			return;
		}
		res.redirect('/me');
		return;
	}

	var token = createToken(1024);
	req.session.csrftoken = token;
	req.session.save((err) => {
		if(err){
			next(new ServerError());
			return;
		}

		res.render('build', {
			skin: res.locals.user.skins,
			bot: undefined,
			target: '/build',
			games: global.server.gamePool,
			blockly: global.blockly,
			token: token
		});
	});
});

module.exports = router;
