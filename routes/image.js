var router = require('express').Router();

router.get('/navigation-tri/:color', (req, res, next) => {
	if(typeof req.params.color !== 'string') return;

	res.setHeader('Content-Type', 'image/svg+xml');
	res.send(`
		<svg xmlns="http://www.w3.org/2000/svg" width="30" height="64" viewBox="0 0 0 118 64">
			<polygon points="0,64 30,0 30,64" fill="#${req.params.color}"/>
		</svg>
	`);
});

module.exports = router;
