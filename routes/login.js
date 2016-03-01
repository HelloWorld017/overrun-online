var errors = require('../src/errors');
var NodeRSA = require('node-rsa');
var router = require('express').Router();
var User = require('../src/player');

var AlreadyLoggedInError = errors.AlreadyLoggedInError;
var InvalidDataError = errors.InvalidDataError;
var InvalidTokenError = erros.InvalidTokenError;
var PasswordNotEqualError = errors.PasswordNotEqualError;
var ServerError = errors.ServerError;

router.all('/', (req, res, next) => {
	if(req.method === 'POST'){
		if(req.local.auth){
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
		var password = new NodeRSA(req.session.rsa).decrypt(req.body.password);

		global.mongo
		.collection(global.config['db-user-name'])
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
	}else{
        var key = new NodeRSA({b: 4096});
        res.session.rsa = key.exportKey('pkcs1-private'); //Session is saved in server.
		res.render('login', {
            rsa: key.exportKey('pkcs8-public')
        });
	}
});

module.exports = router;
