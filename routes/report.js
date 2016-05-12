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
	res.render('report', {
		length : global.config['max-report-length']
	});
});

router.post('/', (req, res, next) => {
	if(!req.body.content || req.body.content.length > global.config['max-report-length']){
		next(new InvalidDataError());
		return;
	}

	global.mongo
		.collection(global.config['collection-report'])
		.insertOne({
			name: res.locals.user.getName(),
			content: req.body.content
		});
});

router.get('/reports', (req, res, next) => {
	if(!res.locals.user.isAdmin){
		var error = new Error("Not Found");
		error.status = 404;
		next(error);
		return;
	}

	global.mongo
		.collection(global.config['collection-report'])
		.find({})
		.toArray((err, reports) => {
			if(err){
				next(new ServerError());
				return;
			}
			//TODO
		});
});

module.exports = router;
