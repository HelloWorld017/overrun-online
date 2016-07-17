var ejs = require('ejs');
var fs = require('fs');
var mg = require('nodemailer-mailgun-transport');

var auth = {
	api_key: global.config['mailgun-api'],
	domain: global.config['mailgun-domain']
};

var transporter = require('nodemailer').createTransport();

var bodyTemplate = {
	from: `"${global.config['email-from']}" <${global.config['email-from-address']}>`
};

module.exports = {
	send: (subject, sendTo, template, content) => {
		var mail = bodyTemplate;
		mail.subject = subject;
		mail.to = sendTo;
		fs.readFile('./views/' + template + '.ejs','utf8',  (err, res) => {
			if(err){
				console.error(err.toString());
				return;
			}

			mail.html = ejs.render(res, content);
			transporter.sendMail(mail, (err) => {
				if(err){
					console.error(err.toString());
				}
			});
		});
	}
};
