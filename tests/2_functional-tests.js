/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

var testID;
var testReplyID;
var idToDelete; //removed after DELETE /api/threads/test
var idToReport;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {

      test('test POST /api/threads/:board', function(done) {

        //add 11 threads for use in later tests
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 0',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 1',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 2',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 3',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 4',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 5',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 6',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 7',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 8',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 9',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 10',
            delete_password: 'test-password'
          })
          .end();
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'test thread 11',
            delete_password: 'test-password'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });


      });

    });

    suite('GET', function() {

      test('test GET /api/threads/:board', function(done) {

        chai.request(server)
          .get('/api/threads/test')
          .end(function(err, response){

            testID = response.body[0]._id
            idToDelete = response.body[1]._id;
            idToReport = response.body[2]._id;
            //console.log(testID);

            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: testID,
                text: 'reply 0',
                delete_password: 'test-password'
              })
              .end();
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: testID,
                text: 'reply 1',
                delete_password: 'test-password'
              })
              .end();
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: testID,
                text: 'reply 2',
                delete_password: 'test-password'
              })
              .end();
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: testID,
                text: 'reply 3',
                delete_password: 'test-password'
              })
              .end();
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: testID,
                text: 'reply 4',
                delete_password: 'test-password'
              })
              .end(function(err, resp){
                //assert.equal(res.status, 200);
                //done();

                chai.request(server).get('/api/threads/test').end((err, res) => {
                  let firstThread = res.body[0];

                  assert.equal(res.status, 200);
                  assert.isArray(res.body);
                  assert.isAtMost(res.body.length, 10);
                  assert.isAtLeast(res.body[0].bumped_on, res.body[1].bumped_on);

                  //tests for first thread
                  assert.notProperty(res.body[0], 'reported');
                  assert.notProperty(res.body[0], 'delete_password');
                  assert.isArray(res.body[0].replies);
                  assert.isAtMost(res.body[0].replies.length, 3);
                  assert.notProperty(res.body[0].replies[0], 'reported');
                  assert.notProperty(res.body[0].replies[0], 'delete_password');
                  //console.log(res.body[0]);

                  done();
                });
              });
          });


      });


    });

    suite('DELETE', function() {
      //idToDelete
      test('incorrect password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: idToDelete,
            delete_password: 'wrong password'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          })
      });

      test('correct password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: idToDelete,
            delete_password: 'test-password'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

    });

    suite('PUT', function() {

      test('report thread', function(done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({
            thread_id: idToReport
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

    });


  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {

      test('POST a reply to a thread', function(done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id: testID,
            text: 'post reply test',
            delete_password: 'test-password'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

    });

    suite('GET', function() {
      //GET requst to /api/replies/{board}?thread_id={thread_id} should return a thread and all its replies
      //reported and delete_password for each reply should not be visible to user

      test('GET thread and all replies', function(done) {

        chai.request(server)
          .get('/api/replies/test')
          .query({ thread_id: testID })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body.replies);
            assert.notProperty(res.body, 'reported');
            assert.notProperty(res.body, 'delete_password');
            assert.notProperty(res.body.replies[0], 'reported');
            assert.notProperty(res.body.replies[0], 'delete_password');

            //get ID for the thread with text: 'post reply test'
            for(let i = 0; i < res.body.replies.length; i++) {
              if (res.body.replies[i].text == 'post reply test') {
                testReplyID = res.body.replies[i]._id;
                break;
              }
            };

            done();
          })
      });

    });

    suite('PUT', function() {
      //testID testReplyID
      test ('report reply', function(done) {
        chai.request(server)
          .put('/api/replies/test')
          .send({ thread_id: testID, reply_id: testReplyID })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

    });

    suite('DELETE', function() {
      //delete with incorrect password
      test('delete reply - incorrect password', function(done){
        chai.request(server)
          .delete('/api/replies/test')
          .send({
            thread_id: testID,
            reply_id: testReplyID,
            delete_password: 'bad-password'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });

      //delete with correct password
      test('delete reply - correct password', function(done){
        chai.request(server)
          .delete('/api/replies/test')
          .send({
            thread_id: testID,
            reply_id: testReplyID,
            delete_password: 'test-password'
          })
          .end(function(err, res){
            //test response
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');

            //check to see if reply.text is now 'deleted'
            chai.request(server)
              .get('/api/replies/test')
              .query({ thread_id: testID})
              .end(function(err, response){
                let reply;
                for (let i = 0; i < response.body.replies.length; i++){
                  if (response.body.replies[i]._id == testReplyID){
                    reply = response.body.replies[i];
                    break;
                  }
                };
                assert.equal(reply.text, 'deleted');
                done();
              });
          });
      });
    });

  });

});
