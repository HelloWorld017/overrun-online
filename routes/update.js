var router = require('express').Router();

router.get('/', (req, res, next) => {
    if(req.method === 'POST'){
		var user = global.loggedUsers[req.session.userid];

		if(!user || !req.session.userid){
			next(new NotLoggedInError());
			return;
		}

		if(!user.verifyAuth(req.session.token, req)){
			res.redirect('/login');
			return;
		}

		if(!req.body.name || !req.body.email || !req.body.phone | !req.body.region || !req.body.school || !req.body.grade){
			next(new InvalidDataError());
			return;
		}

		if(!(/(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/.test(req.body.email) && /^[a-zA-Z0-9ㄱ-ㅎ가-힣#-_.]{2,11}$/.test(req.body.name))){
			next(new InvalidDataError());
			return;
		}

		if(!(/^[a-zA-Z0-9가-힣, ]{2,30}$/.test(req.body.region) && /^[a-zA-Z0-9가-힣?]{2,20}$/.test(req.body.school) && /^[0-9]{1,2}$/.test(req.body.grade) && /^(010[0-9]{8,8}|010-[0-9]{4,4}-[0-9]{4,4})$/.test(req.body.phone))){
			next(new InvalidDataError());
			return;
		}

		user.emailVerified = (user.emailVerified && (user.email === req.body.email));
		user.name = req.body.name;
		user.email = req.body.email;
		user.phone = req.body.phone;
		user.region = req.body.region;
		user.school = req.body.school;
		user.grade = req.body.grade;

		user.updateDB('emailVerified');
		user.updateDB('name');
		user.updateDB('email');
		user.updateDB('phone');
		user.updateDB('region');
		user.updateDB('school');
		user.updateDB('grade');

        mailer.send(global.translation['subject-verify-email'], 'verify-email', email, {
            authToken: authToken
        });

		res.redirect('/update');
});

router.post('/', (req, res, next) => {
    if(!req.session.userid){
        res.redirect('/login');
        return;
    }

    var user = global.loggedUsers[req.session.userid];

    if(user === undefined){
        req.session.userid = undefined;
        req.session.token = undefined;
        req.session.save(() => {});
        res.redirect('/login');
        return;
    }

    res.render('user-update', {
        current_name: user.name,
        current_id: req.session.userid,
        current_email: user.email,
        current_grade: user.grade,
        current_school: user.school,
        current_region: user.region,
        current_phone: user.phone
    });
})

router.get('/password', (req, res, next) => {

});
