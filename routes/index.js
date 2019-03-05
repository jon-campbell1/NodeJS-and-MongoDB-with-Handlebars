var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require("mongodb").ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/test';
var db = require('monk')('localhost:27017/test');
var userData = db.get('user-data');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  title: String,
  content: String,
  author: String
}, {collection: 'user-data'});
var UserData = mongoose.model('UserData', userDataSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  req.session.errors = null;
});

router.get('/get-data', function(req, res, next) {
  UserData.find()
    .then(function(doc) {
      res.render('index', {items: doc});
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//USING MONK
router.get('/get-data',function(req, res, next) {
  var resultArray = [];
  var data = userData.find({});
  data.then(function(docs) {
    res.render('index', {items: docs});
  });
});

// USING MONGODB
router.get('/get-data',function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.db('test').collection('user-data').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index',{items: resultArray});
    });
  })
});

router.post('/insert',function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  }
  var data = new UserData(item);
  data.save();
  res.redirect('/');
});

router.post('/insert',function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  }
  userData.insert(item);
  res.redirect('/');
});


router.post('/insert',function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  }
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    db.db('test').collection('user-data').insertOne(item, function(err, result){
      assert.equal(null, err);
      console.log("Item inserted");
      db.close();
    });
  });
  res.redirect('/');
});


router.post('/update',function(req, res, next) {
  var id = req.body.id;
  UserData.findById(id, function(err, doc) {
    if(err) {
      console.error('error, no entry found');
    }
    doc.title = req.body.title;
    doc.content = req.body.content;
    doc.author = req.body.author;
    doc.save();
  });
  res.redirect('/');
});

router.post('/update',function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  }
  var id = req.body.id;
  userData.update({"_id": db.id(id)}, item);
  res.redirect('/');
});

router.post('/update',function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  }
  var id = req.body.id;
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    db.db('test').collection('user-data').update({"_id" : objectId(id)}, {$set: item} ,function(err, result){
      assert.equal(null, err);
      console.log("Item updated");
      db.close();
    });
  });
  res.redirect('/');
});

router.post('/delete',function(req, res, next) {
  var id = req.body.id;
  UserData.findByIdAndRemove(id).exec();
  res.redirect('/');
});

router.post('/delete',function(req, res, next) {
  var id = req.body.id;
  userData.remove({"_id": db.id(id)});
  res.redirect('/');
});

router.post('/delete',function(req, res, next) {
  var id = req.body.id;
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    db.db('test').collection('user-data').deleteOne({"_id" : objectId(id)}, function(err, result){
      assert.equal(null, err);
      console.log("Item deleted");
      db.close();
    });
  });
  res.redirect('/');
});

module.exports = router;
