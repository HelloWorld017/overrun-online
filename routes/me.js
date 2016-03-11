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
	if(!res.locals.auth){
		next(new NotLoggedInError());
		return;
	}

	res.render('update', {
		id: res.locals.user.name,
		name: res.locals.user.nickname,
		email: res.locals.user.email
	});
})
router.post('/update', (req, res, next) => {
	if(!req.session.auth){
		next(new NotLoggedInError());
		return;
	}

	var user = res.locals.user;

	if(!req.body.name || !req.body.email){
		next(new InvalidDataError());
		return;
	}

	if(!(/(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/.test(req.body.email) && /^[a-zA-Z0-9ㄱ-ㅎ가-힣#-_.]{2,11}$/.test(req.body.name))){
		next(new InvalidDataError());
		return;
	}

	user.emailVerified = (user.emailVerified && (user.email === req.body.email));
	user.nickname = req.body.name;
	user.email = req.body.email;

	global.mongo
		.collection(global.config['collection-user'])
		.findOneAndUpdate({name: user.name}, {
			$set: {
				nickname: user.nickname
				email: user.email,
				emailVerified: emailVerified
			}
		});

	if(user.emailVerified === false){
		mailer.send(global.translation['subject-verify-email'], 'verify-email', email, {
			authToken: authToken
		});
		
	}

	res.redirect('/update');
});

router.get('/update/password', (req, res, next) => {

});

module.exports = router;
