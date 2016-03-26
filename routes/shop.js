var createToken = require('../src/create-token');
var router = require('express').Router();

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

	if(!(global.config['shop-items'][req.params.section] && global.config['shop-items'][req.params.item])){
		next(new InvalidDataError());
		return;
	}

	
});
