var router = require('express').Router();

var InvalidDataError = require('../src/errors').InvalidDataError;

router.get('/:name', (req, res, next) => {
	if(!req.params.name){
		next(new InvalidDataError());
		return;
	}

	var name = req.params.name.replace(/[^a-zA-Z0-9-]/g, '');
	if(!global.apiList[name]){
		res.json([]);
		return;
	}

	res.json(global.apiList[name]);
});

module.exports = router;
