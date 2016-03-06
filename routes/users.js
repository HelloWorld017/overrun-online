var express = require('express');
var router = express.Router();

router.get('/:user', (req, res, next) => {
	global.mongo
		.collection(global.config['collection-user'])
		.find({id: req.params.user})
		.toArray((err, arr) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(arr.length <= 0){
				next();
				return;
			}

			res.render('user', {
				data: arr.name
			});
		});
});

module.exports = router;
