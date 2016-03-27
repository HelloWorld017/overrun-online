var router = require('express').Router();

router.get('/', (req, res, next) => {
	/* TODO ejs import async.forEachOf(global.plugins, (v, k, cb) => {
		if(v.tutorial !== undefined){

		}
	}); */
	res.render('tutorial');
});

module.exports = router;
