var router = require('express').Router;

router.all((req, res, next) => {
	if(req.method === 'POST'){
		if(!req.local.auth){
			next(new NotLoggedInError());
			return;
		}

		if(req.body.name === undefined || req.body.skin === undefined || req.body.code === undefined){
			next(new InvalidDataError());
			return;
		}

		if(!/[A-Za-z0-9가-힣ㄱ-ㅎ-+_()]{3,20}/.test(req.body.name){
			next(new InvalidDataError());
			return;
		}
		
		if(!req.user.skins.inclues(req.body.skin)){
			//TODO update user.skins
			next(new InvalidDataError());
			return;
		}
		
	}
});

module.exports = router;
