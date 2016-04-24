var errors = require(global.src('errors'));
var express = require('express');

var NotLoggedInError = errors.NotLoggedInError;
var AlreadyEntriedError = errors.AlreadyEntriedError;

const PLUGIN_VIEW_PATH = '../plugins/common-entry/';

function view(template){
	return PLUGIN_VIEW_PATH + template;
}

function requestRouter(pluginName, entryName, acceptsTypes){
	acceptsTypes = acceptsTypes || [entryName + '-RANKED', entryName + '-UNRANKED'];
	router = express.Router();

	router.use((req, res, next) => {
		if(!res.locals.auth){
			next(new NotLoggedInError());
			return;
		}

		if(res.locals.user.currentGame){
			next(new AlreadyEntriedError());
			return;
		}

		next();
	});

	router.get(`/${pluginName}`, (req, res, next) => {
		res.render(view('entry-select-bot'), {
			pluginName: pluginName,
			acceptsTypes: acceptsTypes
		});
	});

	router.get(`/${pluginName}/selected/:bot`, (req, res, next) => {
		res.render(view('entry'), {
			pluginName: pluginName,
			entryName: entryName + '-RANKED',
			bot: req.params.bot
		});
	});

	router.get(`/${pluginName}/unranked/:bot`, (req, res, next) => {
		res.render(view('unranked-entry'), {
			pluginName: pluginName,
			entryName: entryName + '-UNRANKED',
			bot: req.params.bot
		});
	});

	return router;
}

module.exports = requestRouter;
