var bcrypt = require('bcrypt');
var createToken = require('../src/create-token');
var errors = require('../src/errors');
var NodeRSA = require('node-rsa');
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

router.all('/', (req, resp, next) => {
	if(req.method === 'POST'){
		if(req.locals.auth){
			next(new AlreadyLoggedInError());
			return;
		}

		if(!req.body['g-recaptcha-response']){
			next(new CaptchaError());
			return;
		}

		if(!req.session.rsa){
            next(new InvalidTokenError());
            return;
        }

		var id = req.body.id;
		var password = new NodeRSA(req.session.rsa).decrypt(req.body.password);
		var name = req.body.name;
		var email = req.body.email;

		if(password !== req.body['password-check']){
			next(new PasswordNotEqualError());
			return;
		}

		global.mongo
			.collection(global.config['collection-user'])
			.find({id: id})
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
						    if(success){
								//Test id, email, name
								if(!(/^[a-zA-Z0-9][a-zA-Z0-9-_.]{4,11}$/.test(id) && /(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/.test(email) && /^[a-zA-Z0-9ㄱ-ㅎ가-힣#-_.]{2,11}$/.test(name))){
									next(new InvalidDataError());
									return;
								}

								bcrypt.genSalt(8, function(err1, salt) {
							        if(err1){
										console.error(err1.message);
										next(new ServerError());
										return;
									}

							        bcrypt.hash(password, salt, function(err2, hash) {
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

										mailer.send('verify-email', email, {
											authToken: authToken;
										});

										resp.redirect('/login');
									});
								});
							}else{
								next(new CaptchaError());
								return;
							}
					});
				});
			});
	}else{
		var key = new NodeRSA({b: 4096});
        res.session.rsa = key.exportKey('pkcs1-private'); //Session is saved in server.
		resp.render('register', {
            rsa: key.exportKey('pkcs8-public')
        });
	}
});

module.exports = router;
