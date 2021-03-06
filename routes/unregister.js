var createToken = require('../src/create-token');
var router = require('express').Router();
var errors = require('../src/errors');

var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = errors.NotLoggedInError;
var ServerError = errors.ServerError;

router.all('/', (req, res, next) => {
	if(req.method === 'POST'){
		if(!req.body.token){
			next(new InvalidDataError());
			return;
		}

		if(!res.locals.auth){
			next(new NotLoggedInError());
			return;
		}

		if(req.session.csrftoken !== req.body.token){
			next(new InvalidDataError());
			return;
		}

		res.locals.user.unregistered = true;
		global.mongo
			.collection(global.config['collection-user'])
			.findOneAndUpdate({id: res.locals.user.getName()}, {unregistered: true})
			.then(() => {
				res.locals.logout((err) => {
					if(err){
						console.error(err.message);
						next(new ServerError());
						return;
					}

					res.redirect('/');
				});
			}, () => {});

		return;
	}

	var token = createToken(1024);

	req.session.csrftoken = token;
	req.session.save((err) => {
		if(err){
			next(new ServerError());
			return;
		}

		res.render('unregister', {
			token: token
		});
	});
});

module.exports = router;
