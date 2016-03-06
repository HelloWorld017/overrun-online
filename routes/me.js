var router = require('express').Router();

router.use((req, res, next) => {
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}
	next();
});

router.get('/', (req, res, next) => {

});

router.get('/update', (req, res, next) => {

});

router.get('/update/password', (req, res, next) => {

});

module.exports = router;
