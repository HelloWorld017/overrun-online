var async = require('async');
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

var authenticate = require('./routes/authenticate');
var battle = require('./routes/battle');
var build = require('./routes/build');
var find = require('./routes/find');
var friends = require('./routes/friends');
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var me = require('./routes/me');
var rank = require('./routes/rank');
var register = require('./routes/register');
var unregister = require('./routes/unregister');
var user = require('./routes/user');
var validate = require('./routes/validate');

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
	if(res.locals.user && (req.session.token !== res.locals.user.token)) res.locals.user = undefined;
	if(res.locals.user && res.locals.user.unregistered) res.locals.user = undefined;

	res.locals.url = global.config['url'] + req.originalUrl;
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
		});
	});
});

app.use('/', index);
app.use('/authenticate', authenticate);
app.use('/battle', battle);
app.use('/build', build);
app.use('/find', find);
app.use('/friends', friends);
app.use('/login', login);
app.use('/logout', logout);
app.use('/me', me);
app.use('/rank', rank);
app.use('/register', register);
app.use('/unregister', unregister);
app.use('/user', user);
app.use('/validate', validate);

app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	if(err instanceof HttpError){
		if(err instanceof StatusError){
			res.end();
			return;
		}

		res.render('alert', {
			error: err
		});
		return;
	}

	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
