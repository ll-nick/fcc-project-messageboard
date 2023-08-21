const mongoose = require('mongoose');


const ReplySchema = new mongoose.Schema({
    text: { type: String },
    delete_password: { type: String },
    created_on: { type: Date },
    bumped_on: { type: Date },
    reported: { type: Boolean, default: false },
});
const Reply = mongoose.model("Reply", ReplySchema);

const ThreadSchema = new mongoose.Schema({
    text: { type: String },
    delete_password: { type: String },
    reported: { type: Boolean, default: false },
    created_on: { type: Date },
    bumped_on: { type: Date },
    replies: { type: [ReplySchema] },
});
const Thread = mongoose.model("Thread", ThreadSchema);

const BoardSchema = new mongoose.Schema({
    name: { type: String },
    threads: { type: [ThreadSchema] },
});
const Board = mongoose.model("Board", BoardSchema);

exports.Board = Board;
exports.Thread = Thread;
exports.Reply = Reply;