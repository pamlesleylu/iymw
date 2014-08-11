var express = require('express');

var mongo = require('mongodb');
var mongoose = require('mongoose');


var router = express.Router();

mongoose.connect(process.env.MONGOHQ_URL);
var tallySchema = mongoose.Schema({
    ts: Date,
    observation: String
});
var Tally = mongoose.model('Tally', tallySchema);

router.get('/', function(req, res) {
  var yesCount, noCount;

  Tally.count({ observation: 'Y' }, function(err, count){
    yesCount = count;

    Tally.count({ observation: 'N' }, function(err, count){
      noCount = count;
      
      res.render('index', {
        title: 'IYMW',
        yesTally: yesCount,
        noTally: noCount
      });
    });
  });  
});

router.get('/yes', function(req, res) {
  var tal = new Tally({
    ts: new Date(),
    observation: 'Y'
  });

  tal.save(function(err, tally){
    if (err) return console.error(err);

    res.location('/');
    res.redirect('/');
  });
});

router.get('/no', function(req, res) {
  var tal = new Tally({
    ts: new Date(),
    observation: 'N'
  });

  tal.save(function(err, tally){
    if (err) return console.error(err);

    res.location('/');
    res.redirect('/');
  });
});

/* GET home page. */
router.get('/tallylist', function(req, res) {
  // var db = req.db;
  // var collection = db.get('tally');
  // collection.find({}, {}, function(e, docs){
 //    res.render('index', {
 //      'tallylist': docs
 //    });
 //  });

});

module.exports = router;