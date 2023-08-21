const bcrypt = require('bcrypt');

const BoardModel = require('../models').Board;
const ReplyModel = require('../models').Reply;

const SALT_ROUNDS = 10;

exports.postReply = async (req, res) => {
  const boardName = req.params.board;
  const { text, delete_password, thread_id } = req.body;

  try {
    const stamp = new Date();
    const board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const hashedPassword = await bcrypt.hash(delete_password, SALT_ROUNDS);
    const newReply = new ReplyModel({
      text: text,
      delete_password: hashedPassword,
      created_on: stamp,
      bumped_on: stamp,
    });

    thread.replies.push(newReply);
    thread.bumped_on = stamp;

    await board.save();

    res.redirect(`/b/${boardName}/${thread_id}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error adding reply');
  }
};

exports.getReply = async (req, res) => {
  const boardName = req.params.board;
  const thread_id = req.query.thread_id;

  try {
    let board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }
    const formattedReplies = thread.replies.map(reply => ({
      _id: reply._id,
      text: reply.text,
      created_on: reply.created_on
    }));

    return res.json({
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replies: formattedReplies
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error retrieving threads');
  }
};

exports.deleteReply = async (req, res) => {
  const boardName = req.params.board;
  const { thread_id, reply_id, delete_password } = req.body;

  try {
    const board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const reply = thread.replies.find(reply => reply._id.toString() === reply_id);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }

    const isPasswordValid = await bcrypt.compare(delete_password, reply.delete_password);
    if (!isPasswordValid) {
      return res.send('incorrect password');
    }

    reply.text = '[deleted]';
    await board.save();

    res.send('success');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error deleting reply');
  }
};

exports.putReply = async (req, res) => {
  const boardName = req.params.board;
  const { thread_id, reply_id } = req.body;

  try {
    const board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const reply = thread.replies.find(reply => reply._id.toString() === reply_id);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }

    reply.reported = true;
    await board.save();

    res.send('reported');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error reporting reply');
  }
};