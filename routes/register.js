var bcrypt = require('bcrypt-nodejs');
var createToken = require('../src/create-token');
var errors = require('../src/errors');
var recaptcha = require('../src/recaptcha-verify');
var router = require('express').Router();
var mailer = require('../src/mailer');
var Player = require('../src/player');

var AlreadyLoggedInError = errors.AlreadyLoggedInError;
var CaptchaError = errors.CaptchaError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var SameIdAlreadyJoinedError = errors.SameIdAlreadyJoinedError;
var ServerError = errors.ServerError;
var InvalidDataError = errors.InvalidDataError;
var InvalidTokenError = errors.InvalidTokenError;

router.all('/', (req, resp, next) => {
	if(req.method === 'POST'){
		if(resp.locals.auth){
			next(new AlreadyLoggedInError());
			return;
		}

		if(!req.body['g-recaptcha-response']){
			next(new CaptchaError());
			return;
		}

		var id = req.body.id;
		var name = req.body.name;
		var email = req.body.email;

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
			.collection(global.config['collection-user'])
			.find({name: id})
			.toArray((dberr, res) => {
				if(dberr){
					console.error(dberr.message);
					next(new ServerError());
					return;
				}

				if(res.length > 0){
					next(new SameIdAlreadyJoinedError());
					return;
				}

				global.mongo
					.collection(global.config['collection-user'])
					.find({email: email})
					.toArray((dberr2, emailres) => {
						if(emailres.length > 0){
							next(new SameIdAlreadyJoinedError());
							return;
						}

						recaptcha.verify(req, (err, success) => {
						    if(!success){
								next(new CaptchaError());
								return;
							}
							//Test id, email, name
							if(!(/^[a-zA-Z0-9][a-zA-Z0-9-_.]{4,11}$/.test(id) && /(^[a-zA-Z0-9_.+-]{1,30}@[a-zA-Z0-9-]{1,30}\.[a-zA-Z0-9-.]{1,10}$)/.test(email) && /^[a-zA-Z0-9ㄱ-ㅎ가-힣#-_.]{2,20}$/.test(name))){
								next(new InvalidDataError());
								return;
							}

							bcrypt.genSalt(8, (err1, salt) => {
						        if(err1){
									console.error(err1.message);
									next(new ServerError());
									return;
								}

						        bcrypt.hash(password, salt, undefined, (err2, hash) => {
									if(err2){
										console.error(err2.message);
										next(new ServerError());
										return;
									}

									var authToken = createToken(1024);
									Player.register({
										id: id,
										password: hash,
										name: name,
										email: email,
										authToken: authToken
									});

									mailer.send(global.translator('email.verify.title'), email, 'verify-email', {
										authToken: authToken
									});

									resp.redirect('/tutorial');
								});
							});
						});
					});
			});
	}else{
		resp.render('register', {
			rsa: key.exportKey('pkcs8-public')
		});
	}
});

module.exports = router;
