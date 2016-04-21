var errors = require(global.src('errors'));
var router = require('express').Router();

var NotLoggedInError = errors.NotLoggedInError;
var AlreadyEntriedError = errors.AlreadyEntriedError;

const PLUGIN_VIEW_PATH = '../plugins/overrun/';

function view(template){
	return PLUGIN_VIEW_PATH + template;
}

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

router.get('/overrun', (req, res, next) => {
	res.render(view('overrun-entry-select-bot'));
});

router.get('/overrun/selected/:bot', (req, res, next) => {
	res.render(view('overrun-entry'), {
		bot: req.params.bot
	});
});

router.get('/overrun/unranked', (req, res, next) => {
	res.render(view('overrun-unranked-entry'));
});

module.exports = router;
