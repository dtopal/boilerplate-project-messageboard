/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectId;

const CONNECTION_STRING = process.env.DB //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      console.log('database connection successful');
      var db = db.db('board');
      //db.db('board').collection('test').insertOne({ name: 'test name' });


      app.route('/api/threads/:board')

        .post(function (req, res) {
          var board = req.params.board;
          var time = new Date();
          db.collection(board).insertOne({
            text: req.body.text,
            created_on: time,
            bumped_on: time,
            reported: false,
            delete_password: req.body.delete_password,
            replies: []
          }, (err, data) => {
            if (err) {
              res.send('ERROR -- pleas try again');
            } else {
              res.redirect('/b/' + board +'/');
            }
          })
        })

        .get(function (req, res){
          var board = req.params.board;
          db.collection(board).find({}).sort({ bumped_on: -1 }).limit(10).toArray((err, data) => {
            if (err) {
              res.send('ERROR');
            } else {

              data = data.map(doc => {

                var recentReplies = doc.replies.sort((a, b) => b - a).slice(0, 3).map(reply => {
                  return {
                    _id: reply._id,
                    text: reply.text,
                    created_on: reply.created_on
                  }
                });

                return {
                  _id: doc._id,
                  text: doc.text,
                  created_on: doc.created_on,
                  bumped_on: doc.bumped_on,
                  replies: recentReplies
                };
              });

              res.send(data);
            }
          })

        })

        .put(function (req, res){
          var board = req.params.board;
          db.collection(board).findOneAndUpdate(
            { _id: ObjectId(req.body.thread_id) },
            { $set: { reported: true } },
            { returnOriginal: false },
            function(err, data){
              if (err) {
                res.send('ERROR -- please try again');
              } else {
                res.send('success');
              }
            }
          )
        })

        .delete(function (req, res){
          var board = req.params.board;
          if (!req.body.delete_password) {
            res.send('No password sent');
            return;
          }

          //db.collection(board).findOneAndDelete({ _id: ObjectId(req.body.thread_id) })
          db.collection(board).findOne({ _id: ObjectId(req.body.thread_id) }, function(err, doc){
            if (doc.delete_password == req.body.delete_password) {
              //console.log('found it');
              db.collection(board).deleteOne({ _id: ObjectId(req.body.thread_id) }, function(err, data){
                if (err) {
                  res.send('ERROR -- please try again');
                } else {
                  res.send('success');
                }
              })
            } else {
              res.send('incorrect password');
            }
          })
        });

      app.route('/api/replies/:board')

        .post(function(req, res) {
          var board = req.params.board;
          var time = new Date();
          var reply = {
            _id: ObjectId(),
            text: req.body.text,
            created_on: time,
            delete_password: req.body.delete_password,
            reported: false
          };

          db.collection(board).findOneAndUpdate(
            { _id: ObjectId(req.body.thread_id) },
            { $set: { bumped_on: time }, $push: { replies: reply } },
            { returnOriginal: false },
            function(err, data) {
              if (err) {
                console.log('ERROR -- please try again');
              } else {
                res.redirect('/b/' + board + '/' + req.body.thread_id + '/');
              }
            }
          )
        })

        .get(function (req, res){
          var board = req.params.board;
          db.collection(board).findOne({ _id: ObjectId(req.query.thread_id) }, (err, doc) => {
            //console.log(doc);
            var currReplies = doc.replies.map(reply => {
              return {
                _id: reply._id,
                text: reply.text,
                created_on: reply.created_on,
              }
            });
            var result = {
              _id: doc._id,
              created_on: doc.created_on,
              bumped_on: doc.bumped_on,
              replies: currReplies
            }
            res.json(result);
          })

        })

        .put(function (req, res){
          var board = req.params.board;
          //req.body.thread_id
          //req.body.reply_id
          db.collection(board).findOneAndUpdate(
            { _id: ObjectId(req.body.thread_id), "replies._id": ObjectId(req.body.reply_id) },
            { $set: { "replies.$.reported": true } },
            function(err, doc){
              res.send('success');
            }
          )
        })

        .delete(function (req, res){
          var board = req.params.board;
          //db.collection(board).findOne({ _id: ObjectId(req.body.thread_id) }, (err, doc) => {})
          db.collection(board).findOne({ _id: ObjectId(req.body.thread_id) }, function(err, doc){
            //reply_id
            //delete_password
            var idx = 0;
            for (let i = 0; i < doc.replies.length; i++){
              if (req.body.reply_id == ObjectId(doc.replies[i]._id)){
                break;
              };
              idx++;
            };
            var reply = doc.replies[idx];
            if (reply.delete_password == req.body.delete_password){
              //do the thing
              //res.send('correct password!!!!!!')
              db.collection(board).findOneAndUpdate(
                { _id: ObjectId(req.body.thread_id), "replies._id": ObjectId(req.body.reply_id) },
                { $set: { "replies.$.text": "deleted" } },
                function (err, doc){
                  res.send('success');
                }
              );
            } else {
              res.send('incorrect password');
            }
          })
        })

      //404 Not Found Middleware
      app.use(function(req, res, next) {
        res.status(404)
          .type('text')
          .send('Not Found');
      });




    }
  });

};
