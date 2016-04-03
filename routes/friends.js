var router = require('express').Router();

router.use((req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	next();
});

router.get('/', (req, res, next) => {
	res.render('friends');
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

	res.end();
});

router.get('/search/id/:id', (req, res, next) => {
	if(!req.params.id){
		next(new InvalidDataError());
		return;
	}

	if(!/^[a-zA-Z0-9][a-zA-Z0-9-_.]{4,11}$/.test(req.params.id)){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({name: new RegExp("^" + req.params.id)})
		.toArray((err, users) => {
			if(err){
				next(new ServerError());
				console.error(err.toString());
				return;
			}

			res.json(users.map((v) => {
				return v.name
			}));
		});
});

router.get('/search/email/:email', (req, res, next) => {
	if(!req.params.email){
		next(new InvalidDataError());
		return;
	}

	if(!/(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/.test(req.params.email)){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({email: req.params.email})
		.toArray((err, users) => {
			if(err){
				next(new ServerError());
				console.error(err.toString());
				return;
			}

			res.json(users.map((v) => {
				return v.name
			}));
		});
});

router.get('/search/github/:github', (req, res, next) => {
	if(!req.params.github){
		next(new InvalidDataError());
		return;
	}

	if(!/^(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])|([a-zA-Z0-9]+))$/.test(req.params.github)){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-user'])
		.find({github: req.params.github})
		.toArray((err, users) => {
			if(err){
				next(new ServerError());
				console.error(err.toString());
				return;
			}

			res.json(users.map((v) => {
				return v.name
			}));
		});
});

module.exports = router;
