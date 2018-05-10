let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/profile', function(req, res, next) {
    res.render('user/profile', { title: 'profile' });
});

module.exports = router;
