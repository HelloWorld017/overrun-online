var createToken = require('../src/create-token');
var errors = reuire('../src/errors');
var mailer = require('../src/mailer');
var router = require('express').Router();

var AlreadyLoggedInError = errors.AlreadyLoggedInError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var ServerError = errors.ServerError;

router.post('/password', (req, res, next) => {
	if(res.locals.auth){
		next(new AlreadyLoggedInError());
		return;
	}

	var id = req.body.id;
	var email = req.body.email;

	global.mongo
		.collection(global.config['collection-user'])
		.find({id: id})
		.limit(1)
		.toArray((err, results) => {
			if(err){
				console.log(err.message);
				next(new ServerError());
				return;
			}

			if(results.length <= 0){
				next(new PasswordNotEqualError());
				return;
			}

			if(email === results[0].email){
				var generatedToken = createToken(512);

				global.mongo
					.collection(global.config['collection-reset'])
					.find({id: id})
					.toArray((err, res) => {
						if(err){
							next(new ServerError());
							return;
						}

						if(res.length === 0){
							global.mongo
								.collection(global.config['collection-reset'])
								.insert({
									id: id,
									reset_token: generatedToken,
									valid_until: Date.now() + 3600
								});

						}else{
							global.mongo
								.collection(global.config['collection-reset'])
								.findOneAndUpdate({id: id}, {
									$set: {
										reset_token: generatedToken,
										valid_until: Date.now() + 3600
									}
								});
						}

						mailer.send(global.translation['subject-find-email'], req.body.email, 'find-password', {
							reset_token: generatedToken
						});
					});
			}
		});

	res.render('alert', {
		redirect: undefined,
		message: global.translation['alert-checkemail']
	});
});

router.post('/password/auth/:token', (req, res, next) => {
	if(!req.body.password || !req.body['password-check']){
		next(new InvalidDataError());
		return;
	}

	var password = new NodeRSA(req.session.rsa).decrypt(req.body.password);

	if(password !== req.body['password-check']){
		next(new PasswordNotEqualError());
		return;
	}

	global.mongo
		.collection(global.config['collection-reset'])
		.find({id: id})
});

router.get('/password/auth/:token', (req, res, next) => {
	var key = new NodeRSA({b: 4096});
	res.session.rsa = key.exportKey('pkcs1-private');
	res.render('password-missing-reset', {
		rsa: key.exportKey('pkcs8-public')
	});
});

router.post('/id', (req, res, next) => {
	if(res.locals.auth){
		next(new AlreadyLoggedInError());
		return;
	}

	var email = req.body.email;

	global.mongo
		.collection(global.config['collection-user'])
		.find({
			email: email
		})
		.limit(1)
		.toArray((err, results) => {
			if(err){
				console.log(err.message);
				next(new ServerError());
				return;
			}

			if(results.length <= 0){
				next(new PasswordNotEqualError());
				return;
			}
		});
	res.render('id-missing-result', {
		id:
	});
});

router.get('/', (req, res, next) => {
	res.render('missing');
});

module.exports = router;
