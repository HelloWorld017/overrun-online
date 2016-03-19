var router = require('express').Router();

router.get('/add/:user', (req, res, next) => {
    if(!res.locals.auth){
        next(new NotLoggedInError());
        return;
    }


});

module.exports = router;
