var router = require('express').Router();

router.get('/', (req, res, next) => {
	res.render('tutorial');
});

module.exports = router;
