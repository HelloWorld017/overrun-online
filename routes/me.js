var bcrypt = require('bcrypt-nodejs');
var errors = require('../src/errors');
var mailer = require('../src/mailer');
var router = require('express').Router();

var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = errors.NotLoggedInError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var ServerError = errors.ServerError;

router.use((req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}
	next();
});

router.get('/', (req, res, next) => {
	res.render('./user');
});

router.get('/update', (req, res, next) => {
	res.render('update', {
		id: res.locals.user.name,
		name: res.locals.user.nickname,
		email: res.locals.user.email,
		github: res.locals.user.github
	});
});

router.post('/update', (req, res, next) => {
	var user = res.locals.user;

	if(!req.body.name || !req.body.email){
		next(new InvalidDataError());
		return;
	}

	if(!(/(^[a-zA-Z0-9_.+-]{1,30}@[a-zA-Z0-9-]{1,30}\.[a-zA-Z0-9-.]{1,10}$)/.test(req.body.email) && /^[a-zA-Z0-9ㄱ-ㅎ가-힣#-_.]{2,20}$/.test(req.body.name) && /^(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])|([a-zA-Z0-9]+))$/.test(req.body.github))){
		next(new InvalidDataError());
		return;
	}

	user.emailVerified = (user.emailVerified && (user.email === req.body.email));
	user.nickname = req.body.name;
	user.email = req.body.email;
	user.github = req.body.github;

	global.mongo
		.collection(global.config['collection-user'])
		.findOneAndUpdate({name: user.name}, {
			$set: {
				nickname: user.nickname,
				github: user.github,
				email: user.email,
				emailVerified: user.emailVerified
			}
		});

	if(user.emailVerified === false){
		mailer.send(global.translator('email.verify.subject'), 'verify-email', email, {
			authToken: authToken
		});

		res.locals.logout();
		res.redirect('/');
		return;
	}

	res.redirect('/me');
});

router.get('/update/password', (req, res, next) => {
	res.render('update-password', {
		rsa: global.key.exportKey('pkcs8-public')
	});
});

router.post('/update/password', (req, resp, next) => {
	if(!req.body.original || !req.body.newPw || !req.body['newPw-check']){
		next(new InvalidDataError());
		return;
	}

	if(req.body.newPw !== req.body['newPw-check']){
		next(new PasswordNotEqualError());
		return;
	}

	try{
		var originalPw = global.key.decrypt(req.body.original, 'utf8');
		var newPw = global.key.decrypt(req.body.newPw, 'utf8');
	}catch(err){
		next(new InvalidDataError());
		return;
	}

	bcrypt.compare(originalPw, resp.locals.user.pw, (err, res) => {
		if(err){
			console.error(err.toString());
			next(new ServerError());
			return;
		}

		if(!res){
			next(new PasswordNotEqualError());
			return;
		}

		bcrypt.genSalt(8, (err, salt) => {
			if(err){
				console.error(err.toString());
				next(new ServerError());
				return;
			}

			bcrypt.hash(newPw, salt, undefined, (err, hash) => {
				if(err){
					console.error(err.toString());
					next(new ServerError());
					return;
				}

				global.mongo
					.collection(global.config['collection-user'])
					.findOneAndUpdate({name: resp.locals.user.name}, {
						$set: {
							pw: hash
						}
					})
					.then(() => {
						resp.locals.logout((err) => {
							if(err){
					            console.error(err.message);
					            next(new ServerError());
					            return;
					        }

							resp.redirect('/');
						});
					});
			});
		});
	});
});
module.exports = router;
