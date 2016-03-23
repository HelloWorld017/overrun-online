var ejs = require('ejs');
var fs = require('fs');

var transporter = require('nodemailer').createTransport(`smtps://${global.config['gmail-id']}%40gmail.com:${global.config['gmail-pw']}@smtp.gmail.com`);

var bodyTemplate = {
	from: `"${global.config['email-from']}" <${global.config['email-from-address']}>`
};

module.exports = {
	send: (subject, sendTo, template, content) => {
		var mail = bodyTemplate;
		mail.subject = subject;
		mail.to = sendTo;
		fs.readFile('/views/' + template + '.ejs', (err, res) => {
			mail.html = ejs.render(res, content);
			transporter.sendMail(mail);
		});
	}
};

