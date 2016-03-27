var createToken = require('../src/create-token');
var bcrypt = require('bcrypt-nodejs');
var errors = require('../src/errors');
var mailer = require('../src/mailer');
var recaptcha = require('../src/recaptcha-verify');
var router = require('express').Router();

var AlreadyLoggedInError = errors.AlreadyLoggedInError;
var CaptchaError = errors.CaptchaError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var InvalidDataError = errors.InvalidDataError;
var ServerError = errors.ServerError;

router.post('/password', (req, res, next) => {
	if(res.locals.auth){
		next(new AlreadyLoggedInError());
		return;
	}

	recaptcha.verify(req, (err, recaptchaVerified) => {
		if(err){
			console.error(err.toString());
			next(new ServerError());
			return;
		}

		if(!recaptchaVerified){
			next(new CaptchaError());
			return;
		}

		var id = req.body.id;
		var email = req.body.email;

		global.mongo
			.collection(global.config['collection-user'])
			.find({name: id})
			.limit(1)
			.toArray((err, results) => {
				if(err){
					console.error(err.message);
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

							mailer.send(global.translator('email.find.title'), req.body.email, 'find-password-email', {
								resetToken: generatedToken
							});
						});
				}
			});

		res.render('alert', {
			redirect: undefined,
			message: global.translator('alert-checkemail')
		});
	});
});

router.all('/password/auth/:token', (req, res, next) => {
	if(!req.body.password || !req.body['password-check']){
		next(new InvalidDataError());
		return;
	}

	if(req.body.password !== req.body['password-check']){
		next(new PasswordNotEqualError());
		return;
	}

	try{
		var password = global.key.decrypt(req.body.password, 'utf8');
	}catch(err){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-reset'])
		.find({reset_token: req.params.token})
		.toArray((err, result) => {
			if(err || result.length === 0){
				next(new InvalidDataError());
				return;
			}

			if(result.valid_until > Date.now() || result.reset_token !== req.params.token){
				next(new InvalidTokenError());
				return;
			}

			bcrypt.genSalt(8, (err, salt) => {
				if(err){
					next(new ServerError());
					return;
				}

				bcrypt.hash(password, salt, undefined, (err, hash) => {
					if(err){
						next(new ServerError());
						return;
					}

					global.mongo
						.collection(global.config['collection-user'])
						.findOneAndUpdate({name: results[0].id}, {
							$set: {
								pw: hash
							}
						}).then(() => {
							global.mongo
								.collection(global.config['collection-reset'])
								.findOneAndUpdate({reset_token: req.params.token}, {
									$set: {
										valid_until: 0
									}
								}).then(() => {
									res.redirect('/');
								});
						});
				});
			});
		});
});

router.get('/password/auth/:token', (req, res, next) => {
	res.render('password-missing-reset', {
		rsa: global.key.exportKey('pkcs8-public')
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

			res.render('id-missing-result', {
				id: results[0].name
			});
		});
});

router.get('/', (req, res, next) => {
	res.render('missing');
});

module.exports = router;
