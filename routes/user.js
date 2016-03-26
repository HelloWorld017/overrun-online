var errors = require('../src/errors');
var express = require('express');
var router = express.Router();
var Player = require('../src/player');

var ServerError = errors.ServerError;
var InvalidDataError = errors.InvalidDataError;


router.get('/:user', (req, res, next) => {
	global.mongo
		.collection(global.config['collection-user'])
		.find({name: req.params.user})
		.toArray((err, arr) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(arr.length <= 0){
				next(new InvalidDataError());
				return;
			}

			res.render('user', {
				user: new Player(arr[0])
			});
		});
});

module.exports = router;
