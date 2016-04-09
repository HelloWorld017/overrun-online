var async = require('async');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var errors = require('./src/errors');
var express = require('express');
var favicon = require('serve-favicon');
var jsxCompile = require('express-jsx');
var logger = require('morgan');
var path = require('path');
var session = require('express-session');

var HttpError = errors.HttpError;
var RedirectError = errors.RedirectError;
var StatusError = errors.StatusError;
var MongoStore = require('connect-mongo')(session);

var about = require('./routes/about');
var authenticate = require('./routes/authenticate');
var battle = require('./routes/battle');
var build = require('./routes/build');
var find = require('./routes/find');
var friends = require('./routes/friends');
var image = require('./routes/image');
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var me = require('./routes/me');
var rank = require('./routes/rank');
var register = require('./routes/register');
var shop = require('./routes/shop');
var tutorial = require('./routes/tutorial');
var unregister = require('./routes/unregister');
var user = require('./routes/user');
var validate = require('./routes/validate');

var app = express();

var pluginLoadCallback = [];
var pluginLoadFinished = false;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(jsxCompile(path.join(__dirname, 'plugins', 'public')));
app.use(express.static(path.join(__dirname, 'plugins')));
app.use(express.static(path.join(__dirname, 'public')));

global.session = session({
	secret: global.config['session-secret'],
	saveUninitialized: false,
	resave: false,
	store: new MongoStore({
		url: 'mongodb://' + global.config['db-address'] + ':' + global.config['db-port'] + '/' + global.config['collection-session'],
		ttl: 3600 * 24 * 7,
		touchAfter: 3 * 3600
	})
});

app.use(global.session);

app.use((req, res, next) => {
	res.locals.user = (global.users[req.session.userid]);
	if(res.locals.user && (req.session.token !== res.locals.user.token)) res.locals.user = undefined;
	if(res.locals.user && res.locals.user.unregistered) res.locals.user = undefined;

	res.locals.url = global.config['url'] + req.originalUrl;
	res.locals.auth = (res.locals.user !== undefined);
	res.locals.emailHash = (res.locals.auth) ? res.locals.user.getHashedEmail() : '';
	res.locals.localUser = res.locals.user;

	res.locals.logout = (cb) => {
		req.session.userid = undefined;
		req.session.token = undefined;
		req.session.save((err) => {
			(cb || () => {})(err);
		});
	};

	var _render = res.render;

	res.render = (name, options, cb) => {
		res.locals.renderTarget = name;
		_render.call(res, name, options, cb);
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
app.use('/about', about);
app.use('/authenticate', authenticate);
app.use('/battle', battle);
app.use('/build', build);
app.use('/find', find);
app.use('/friends', friends);
app.use('/image', image);
app.use('/login', login);
app.use('/logout', logout);
app.use('/me', me);
app.use('/rank', rank);
app.use('/register', register);
app.use('/shop', shop);
app.use('/tutorial', tutorial);
app.use('/unregister', unregister);
app.use('/user', user);
app.use('/validate', validate);

async.forEachOf(global.plugins, (plugin, pluginName, cb) => {
	if(plugin.routers){
		async.forEachOf(plugin.routers, (router, routerName, callback) => {
			app.use(routerName, router);
			callback();
		}, () => {
			cb();
		});
	}else cb();
}, () => {
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

		console.error(err.toString());

		res.render('error', {
			message: err.message,
			error: {}
		});

	});

	pluginLoadFinished = true;
	console.log(global.translator('server.http.load'));

	pluginLoadCallback.forEach((v) => {
		process.nextTick(() => {
			v(app);
		});
	});
});

module.exports = (cb) => {
	if(pluginLoadFinished){
		cb(app);
	}else{
		pluginLoadCallback.push(cb);
	}
};
