var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('index', { title: 'Is My Manager Working?' });
  res.redirect('/tally');
});

module.exports = router;
