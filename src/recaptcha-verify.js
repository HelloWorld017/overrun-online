var needle = require('needle');

function verify(req, cb){
	if(!req.body['g-recaptcha-response']){
		cb(null, false);
		return;
	}

	needle
		.post('https://www.google.com/recaptcha/api/siteverify', {
			secret: global.config['recaptcha-secret'],
			response: req.body['g-recaptcha-response']
		}, (err, res) => {
			cb(err, (res.body.success === true));
		});
}

module.exports = {
	verify: verify
};
