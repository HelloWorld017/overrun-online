var router = require('express').Router;

router.get('/', (req, res, next) => {	
	if(req.locals.user === undefined){
	}
});

module.exports = router;

