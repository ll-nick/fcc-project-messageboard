const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let threadToRemoveId = "";
let threadToReportId = "";
let threadToReplyToId = "";
let threadWithReplyToRemoveId = "";
let threadWithReplyToReportId = "";
let replyToRemoveId = "";
let replyToReportId = "";

suite('Functional Tests', function () {

  // Create threads and replys to delete/modifiy in the tests
  before(async () => {
    // Create threads
    await chai
      .request(server)
      .post('/api/threads/test_board')
      .send({
        text: 'thread to be removed',
        delete_password: 'valid password'
      });

    await chai
      .request(server)
      .post('/api/threads/test_board')
      .send({
        text: 'thread to be reported',
        delete_password: 'valid password'
      });

    await chai
      .request(server)
      .post('/api/threads/test_board')
      .send({
        text: 'thread to reply to',
        delete_password: 'valid password'
      });

    await chai
      .request(server)
      .post('/api/threads/test_board')
      .send({
        text: 'thread with reply to be removed',
        delete_password: 'valid password'
      });

    await chai
      .request(server)
      .post('/api/threads/test_board')
      .send({
        text: 'thread with reply to be reported',
        delete_password: 'valid password'
      });

    // Store thread ids
    let res = await chai
      .request(server)
      .get("/api/threads/test_board");
    let threads = res.body;
    threadToRemoveId = threads.find(thread => thread.text === 'thread to be removed')._id;
    threadToReportId = threads.find(thread => thread.text === 'thread to be reported')._id;
    threadToReplyToId = threads.find(thread => thread.text === 'thread to reply to')._id;
    threadWithReplyToRemoveId = threads.find(thread => thread.text === 'thread with reply to be removed')._id;
    threadWithReplyToReportId = threads.find(thread => thread.text === 'thread with reply to be reported')._id;

    // Create replies
    await chai
      .request(server)
      .post('/api/replies/test_board')
      .send({
        text: 'reply to remove',
        delete_password: 'valid password',
        thread_id: threadWithReplyToRemoveId
      });

    await chai
      .request(server)
      .post('/api/replies/test_board')
      .send({
        text: 'reply to report',
        delete_password: 'valid password',
        thread_id: threadWithReplyToReportId
      });

    // Store reply ids
    res = await chai
      .request(server)
      .get("/api/threads/test_board");
    threads = res.body;
    replyToRemoveId = threads.find(thread => thread._id === threadWithReplyToRemoveId).replies.find(reply => reply.text = 'reply to remove')._id;
    replyToReportId = threads.find(thread => thread._id === threadWithReplyToReportId).replies.find(reply => reply.text = 'reply to report')._id;
  });

  test("Creating new thread", async () => {
    const res = await chai
      .request(server)
      .post("/api/threads/test_board")
      .send({
        text: "newly created thread",
        delete_password: "valid password"
      });

    assert.equal(res.status, 200);
  });

  test("Viewing the 10 most recent threads with 3 replies each", async () => {
    const res = await chai
      .request(server)
      .get("/api/threads/test_board");

    assert.equal(res.status, 200);
    assert.isBelow(res.body.length, 11);
    assert.isArray(res.body);
    assert.isBelow(res.body[0].replies.length, 4);
  });

  test("Deleting a thread with the incorrect password", async () => {
    const res = await chai
      .request(server)
      .delete("/api/threads/test_board")
      .send({
        delete_password: "invalid password",
        thread_id: threadToRemoveId
      });

    assert.equal(res.status, 200);
    assert.equal(res.text, "incorrect password");
  });

  test("Deleting a thread with the correct password", async () => {
    const res = await chai
      .request(server)
      .delete("/api/threads/test_board")
      .send({
        delete_password: "valid password",
        thread_id: threadToRemoveId
      })

    assert.equal(res.status, 200);
    assert.equal(res.text, "success");
  });

  test("Reporting a thread", async () => {
    const res = await chai
      .request(server)
      .put("/api/threads/test_board")
      .send({
        thread_id: threadToReportId
      })

    assert.equal(res.status, 200);
    assert.equal(res.text, "reported");
  });

  test("Creating a new reply", async () => {
    const res = await chai
      .request(server)
      .post("/api/replies/test_board")
      .send({
        thread_id: threadToReplyToId,
        text: "reply test",
        delete_password: "valid password"
      });

    assert.equal(res.status, 200);
  });

  test("Viewing a single thread with all replies", async () => {
    const res = await chai
      .request(server)
      .get("/api/replies/test_board")
      .query({
        thread_id: threadWithReplyToRemoveId
      });

    assert.equal(res.status, 200);
    assert.isArray(res.body.replies);
  });

  test("Reporting a reply", async () => {
    const res = await chai
      .request(server)
      .put("/api/replies/test_board")
      .send({
        thread_id: threadWithReplyToReportId,
        reply_id: replyToReportId
      });

    assert.equal(res.status, 200);
    assert.equal(res.text, "reported");
  });

  test("Deleting a reply with the incorrect password", async () => {
    const res = await chai
      .request(server)
      .delete("/api/replies/test_board")
      .send({
        thread_id: threadWithReplyToRemoveId,
        reply_id: replyToRemoveId,
        delete_password: "invalid password"
      })

    assert.equal(res.status, 200);
    assert.equal(res.text, "incorrect password");
  });

  test("Deleting a reply with the correct password", async () => {
    const res = await chai
      .request(server)
      .delete("/api/replies/test_board")
      .send({
        thread_id: threadWithReplyToRemoveId,
        reply_id: replyToRemoveId,
        delete_password: "valid password"
      })

    assert.equal(res.status, 200);
    assert.equal(res.text, "success");
  });
});
