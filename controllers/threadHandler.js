const bcrypt = require('bcrypt');

const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;

const SALT_ROUNDS = 10;

exports.postThread = async (req, res) => {
  const boardName = req.params.board;
  const { text, delete_password } = req.body;

  try {
    let board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      board = new BoardModel({
        name: boardName,
        threads: []
      });
    }

    const stamp = new Date();
    const hashedPassword = await bcrypt.hash(delete_password, SALT_ROUNDS);
    const newThread = new ThreadModel({
      text,
      delete_password: hashedPassword,
      created_on: stamp,
      bumped_on: stamp,
      replies: []
    });

    board.threads.push(newThread);
    await board.save();

    res.redirect(`/b/${boardName}/`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error creating thread');
  }
};

exports.getThread = async (req, res) => {
  const boardName = req.params.board;

  try {
    let board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const threads = board.threads
      .sort((a, b) => b.bumped_on - a.bumped_on)
      .slice(0, 10)
      .map(thread => ({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.slice(0, 3).map(reply => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        }))
      }));

    return res.json(threads);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error retrieving threads');
  }
};

exports.deleteThread = async (req, res) => {
  const boardName = req.params.board;
  const { thread_id, delete_password } = req.body;

  try {
    const board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const isPasswordValid = await bcrypt.compare(delete_password, thread.delete_password);
    if (!isPasswordValid) {
      return res.send('incorrect password');
    }

    thread.remove();
    await board.save();

    res.send('success');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error deleting thread');
  }
};
exports.putThread = async (req, res) => {
  const boardName = req.params.board;
  const { thread_id } = req.body;

  try {
    const board = await BoardModel.findOne({ name: boardName });
    if (!board) {
      return res.status(404).send('Board not found');
    }

    const thread = board.threads.id(thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    thread.reported = true;
    await board.save();

    res.send('reported');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error reporting thread');
  }
};