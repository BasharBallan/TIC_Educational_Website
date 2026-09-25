const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const Quiz = require("../models/quizModel");

// =======================
// Start Conversation Event
// =======================
exports.startConversation = async (io, studentId, doctorId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [studentId, doctorId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [studentId, doctorId],
    });
  }

  io.to(studentId.toString()).emit("conversation:new", conversation);
  io.to(doctorId.toString()).emit("conversation:new", conversation);

  return conversation;
};

// =======================
// Send Message Event
// =======================
exports.sendMessage = async (io, senderId, targetRoom, messageData) => {
  const message = await Message.create({
    sender: senderId,
    ...messageData,
  });

  io.to(targetRoom.toString()).emit("message:new", {
    _id: message._id,
    sender: senderId,
    type: message.type,
    content: message.content,
    fileUrl: message.fileUrl,
    createdAt: message.createdAt,
  });

  return message;
};

// =======================
// Create Group Event
// =======================
exports.createGroup = async (io, doctorId, groupData) => {
  const group = await Group.create({
    createdBy: doctorId,
    ...groupData,
  });

  io.to(doctorId.toString()).emit("group:new", group);

  return group;
};

// =======================
// Join Group Event
// =======================
exports.joinGroup = async (io, groupId, studentId) => {
  const group = await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: studentId } },
    { new: true }
  );

  io.to(groupId.toString()).emit("group:join", {
    groupId,
    studentId,
  });

  return group;
};

// =======================
// Quiz Events
// =======================
exports.sendQuiz = async (io, doctorId, groupId, quizData) => {
  const quiz = await Quiz.create({
    createdBy: doctorId,
    group: groupId,
    ...quizData,
  });

  io.to(groupId.toString()).emit("quiz:new", quiz);

  return quiz;
};

exports.answerQuiz = async (io, quizId, studentId, optionIndex) => {
  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { $push: { answers: { student: studentId, optionIndex } } },
    { new: true }
  );

  io.to(quiz.group.toString()).emit("quiz:answer", {
    quizId,
    studentId,
    optionIndex,
  });

  return quiz;
};
