var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var errors = require('./src/errors');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var session = require('express-session');

var HttpError = errors.HttpError;
var RedirectError = errors.RedirectError;
var StatusError = errors.StatusError;
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: global.config['session-secret'],
	saveUninitialized: false,
	resave: false,
	store: new MongoStore({
		url: 'mongodb://' + global.config['db-address'] + ':' + global.config['db-port'] + '/' + global.config['collection-session'],
		ttl: 3600 * 24 * 7,
		touchAfter: 3 * 3600
	})
}));

app.use((req, res, next) => {
	res.locals.user = (global.users[req.session.userid]);
	if(req.session.token !== res.locals.user.token) res.locals.user = undefined;
	if(res.locals.user.unregistered) res.locals.user = undefined;

	res.locals.auth = (res.locals.user !== undefined);
	res.locals.email = (res.locals.auth) ? crypto.createHash('md5').update(res.locals.user.email.toLowerCase()).digest('hex') : '';
	res.locals.logout = (cb, req, res, next) => {
	    req.session.userid = undefined;
	    req.session.token = undefined;
	    req.session.save((err) => {
	        cb(err);
	    });
	};


	//Anti SQL Injection
	async.map(req.body, (v, cb) => {
		cb(null, (typeof v === 'string' || typeof v === 'number') ? v : '');
	}, (err, result) => {
		req.body = result;
		async.map(req.query, (v, cb) => {
			cb(null, (typeof v === 'string' || typeof v === 'number') ? v : "");
		}, (err2, result2) => {
			req.query = result2;
			next();
		}
	});
});

app.use('/', routes);
app.use('/users', users);

app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	if(err instanceof HttpError){
		if(err instanceof RedirectError){
			res.render('alert', {
				redirect: err.redirect,
				message: err.message
			});
			return;
		}

		if(err instanceof StatusError){
			res.end();
			return;
		}

		res.render('alert', {
			redirect: undefined,
			message: err.message
		});
		return;
	}

	console.error(err.toString());

	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
