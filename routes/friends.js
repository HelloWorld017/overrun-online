var errors = require('../src/errors');
var router = require('express').Router();

var InvalidDataError = errors.InvalidDataError;
var NotLoggedInError = errors.NotLoggedInError;
var ServerError = errors.ServerError;

router.use((req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	next();
});

router.get('/', (req, res, next) => {
	res.render('friends', {
		friends: res.locals.user.friends
	});
});

router.get('/add/:user', (req, res, next) => {
	if(!req.params.user){
		next(new InvalidDataError());
		return;
	}

	if(req.params.user === res.locals.user.getName()){
		next(new InvalidDataError());
		return;
	}

	if(res.locals.user.friends.indexOf(req.params.user) !== -1){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({name: req.params.user})
		.hasNext((err, has) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(!has){
				next(new InvalidDataError());
				return;
			}

			res.locals.user.friends.push(req.params.user);
			res.locals.user.updateFriends();
			res.end();
		});
});

router.get('/remove/:user', (req, res, next) => {
	if(!req.params.user || res.locals.user.friends.indexOf(req.params.user) === -1){
		next(new InvalidDataError());
		return;
	}

	res.locals.user.friends = res.locals.user.friends.filter((user) => {
		return user !== req.params.user;
	});
	res.locals.user.updateFriends();
	res.end();
});

router.get('/search/:query', (req, res, next) => {
	if(!req.params.query){
		next(new InvalidDataError());
		return;
	}

	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	if(!/^[a-zA-Z0-9@_.+-]{1,512}$/.test(req.params.query)){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({$or: [
			{name: new RegExp("^" + req.params.query, 'i')},
			{nickname: new RegExp("^" + req.params.query, 'i')},
			{email: new RegExp("^" + req.params.query, 'i')},
			{github: new RegExp("^" + req.params.query, 'i')}
		]})
		.limit(5)
		.toArray((err, users) => {
			if(err){
				next(new ServerError());
				console.error(err.toString());
				return;
			}

			/*res.json(users.map((v) => v.name).filter((v) => {
				return (res.locals.user.friends.indexOf(v) === -1 && v !== res.locals.user.name);
			}));*/

			res.json(['AAAAAAAAAA', 'AAAAAAAAAA', 'AAAAAAAAAA', 'AAAAAAAAAA', 'AAAAAAAAAA'])
		});
});

module.exports = router;
