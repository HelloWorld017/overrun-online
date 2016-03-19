var errors = require('../src/errors');
var router = require('express').Router();
var Player = require('../src/player');

var AlreadyLoggedInError = errors.AlreadyLoggedInError;
var InvalidDataError = errors.InvalidDataError;
var InvalidTokenError = errors.InvalidTokenError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var ServerError = errors.ServerError;

router.post('/', (req, res, next) => {
	if(res.locals.auth){
		next(new AlreadyLoggedInError());
		return;
	}

	if(!req.session.rsa){
	    next(new InvalidTokenError());
	    return;
	}

	if(!req.body.id || !req.body.password){
		next(new InvalidDataError());
		return;
	}

	var id = req.body.id;

	try{
		var password = global.key.decrypt(req.body.password, 'utf8');
	}catch(err){
		next(new InvalidDataError());
		return;
	}

	global.mongo
	.collection(global.config['collection-user'])
	.find({name: id})
	.limit(1)
	.toArray((err, results) => {
		if(err){
			console.error(err.toString());
			next(new ServerError());
			return;
		}

		if(results.length <= 0){
			next(new PasswordNotEqualError());
			return;
		}
		global.users[id] = new Player(results[0]);

		global.users[id].auth(password, (err1, authToken) => {
			if(err1 || !authToken){
				next(err1);
				return;
			}

			req.session.userid = id;
			req.session.token = authToken;
			req.session.save((err2) => {
				if(err2){
					next(new ServerError());
					return;
				}

				res.redirect('/');
			});
		});
	});
});

router.get('/', (req, res, next) => {
	req.session.rsa = key.exportKey('pkcs1-private');
	req.session.save(() => {
		res.render('login', {
			rsa: key.exportKey('pkcs8-public')
		});
	});
});

module.exports = router;
