var createToken = require('../src/create-token');
var errors = require('../src/errors');
var router = require('express').Router();

var NotLoggedInError = errors.NotLoggedInError;
var InsufficientMoneyError = errors.InsufficientMoneyError;
var InvalidDataError = errors.InvalidDataError;

router.get('/', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	var token = createToken(1024);

	req.session.token = token;
	req.session.save();

	res.render('shop', {
		items: global.config['shop-items'],
		token: token
	});
});

router.post('/buy/:section/:item', (req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(req.session.token !== req.body.token) return;

	if(!(global.config['shop-items'][req.params.section] && global.config['shop-items'][req.params.section][req.params.item])){
		next(new InvalidDataError());
		return;
	}

	var item = global.config['shop-items'][req.params.section][req.params.item];
	if(item.money > res.locals.user.money){
		next(new InsufficientMoneyError());
		return;
	}

	res.locals.user.money -= item.money;
	res.locals.user[req.params.section].push(req.params.item);
	res.locals.user.saveStat();

	res.end();
});

module.exports = router;
