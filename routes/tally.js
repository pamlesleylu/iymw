var express = require('express');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var moment = require('moment');


var router = express.Router();

mongoose.connect(process.env.MONGOHQ_URL);
var tallySchema = mongoose.Schema({
    ts: Date,
    observation: String
});
var Tally = mongoose.model('Tally', tallySchema);

router.get('/', function(req, res) {
  var yesCount, noCount, dtQuery;

  dtQuery = {
    '$gte': moment().startOf('hour'),
    '$lte': moment().endOf('hour')
  };

  Tally.count({ observation: 'Y', ts: dtQuery }, function(err, count){
    yesCount = count;

    Tally.count({ observation: 'N', ts: dtQuery }, function(err, count){
      noCount = count;
      
      res.render('index', {
        pageName: 'home',
        yesTally: yesCount,
        noTally: noCount,
        currentDate: moment().format('MMM D, YYYY')
      });
    });
  });  
});


router.get('/summary/:week?', function(req, res) {

  var wk = (Number(req.params.week) || Number(moment().format('W')) ),
      startDay = moment().week(wk).day('Monday'),
      endDay = moment().week(wk).day('Friday');

  res.render('tally', {
    pageName: 'tally',
    week: wk,
    start: startDay.format('MMM D, YYYY'),
    end: endDay.format('MMM D, YYYY')
  });

});

router.get('/weekly/:week?', function(req, res){
  var wk = (Number(req.params.week) || Number(moment().format('W')) );

  var promise = Tally.aggregate({
    $project: {
      month: {$month: '$ts'},
      day: {$dayOfMonth: '$ts'},
      year: {$year: '$ts'},
      observation: 1,
      week: {$week: '$ts'}
    }
  }).match({
    week: wk - 1
  }).group({
    _id:  {m: '$month', d: '$day', y: '$year', ob: '$observation'},
    count: {$sum: 1}
  }).sort({
    '_id.y': 1,
    '_id.m': 1,
    '_id.d': 1
  }).exec();

  promise.then(function(record){
    var startDay = moment().week(wk).day('Monday'),
        endDay = moment().week(wk).day('Friday'),
        startDate = startDay.date(),
        result = {
          label: startDay.format('MMM D, YYYY') + ' - ' + endDay.format('MMM D, YYYY'),
          prevWeek: wk - 1,
          nextWeek: wk + 1,
          dates:[
            startDay.format('MMM D'), 
            startDay.clone().day(2).format('MMM D'), 
            startDay.clone().day(3).format('MMM D'), 
            startDay.clone().day(4).format('MMM D'), 
            endDay.format('MMM D')
          ], 
          yes:[0,0,0,0,0], 
          no:[0,0,0,0,0] 
        },
        i = 0;

    for (i = 0; i < record.length; i++) {
      if (record[i]._id.ob == 'Y') {
        result.yes[record[i]._id.d - startDate] = record[i].count;
      } else {
        result.no[record[i]._id.d - startDate] = record[i].count;
      }
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(result));
    res.end();
  });
});

router.post('/yes', function(req, res) {
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

router.post('/no', function(req, res) {
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