const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const Quiz = require("../models/quizModel");
const ApiError = require("../utils/apiError");

// ======================================================================
// START CONVERSATION (Student ↔ Doctor)
// ======================================================================
// @desc    Start a new conversation or return existing one
// @route   POST /api/v1/chat/conversations/start
// @access  Private (Student/Doctor)
// ======================================================================
exports.startConversation = asyncHandler(async (req, res, next) => {
  const { studentId, doctorId } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [studentId, doctorId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [studentId, doctorId],
    });
  }

  if (req.io) {
    req.io.to(studentId.toString()).emit("conversation:new", conversation);
    req.io.to(doctorId.toString()).emit("conversation:new", conversation);
  }

  res.status(200).json({
    status: "success",
    data: conversation,
  });
});

// ======================================================================
// SEND MESSAGE
// ======================================================================
// @desc    Send a message inside a conversation or group
// @route   POST /api/v1/chat/messages/send
// @access  Private (Student/Doctor)
// ======================================================================
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, groupId, type, content, fileUrl } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    type,
    content,
    fileUrl,
    conversation: conversationId || null,
    group: groupId || null,
  });

  if (req.io) {
    const targetRoom = groupId ? groupId.toString() : conversationId.toString();
    req.io.to(targetRoom).emit("message:new", {
      _id: message._id,
      sender: req.user._id,
      type: message.type,
      content: message.content,
      fileUrl: message.fileUrl,
      createdAt: message.createdAt,
    });
  }

  res.status(201).json({
    status: "success",
    data: message,
  });
});

// ======================================================================
// CREATE GROUP
// ======================================================================
// @desc    Doctor creates a new group
// @route   POST /api/v1/chat/groups/create
// @access  Private (Doctor)
// ======================================================================
exports.createGroup = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const group = await Group.create({
    name,
    createdBy: req.user._id,
    members: [],
    inviteLink: `invite-${Date.now()}-${req.user._id}`,
  });

  if (req.io) {
    req.io.to(req.user._id.toString()).emit("group:new", group);
  }

  res.status(201).json({
    status: "success",
    data: group,
  });
});

// ======================================================================
// JOIN GROUP
// ======================================================================
// @desc    Student joins a group via invite link
// @route   POST /api/v1/chat/groups/:id/join
// @access  Private (Student)
// ======================================================================
exports.joinGroup = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id;

  const group = await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: req.user._id } },
    { new: true }
  );

  if (!group) {
    return next(new ApiError("Group not found", 404));
  }

  if (req.io) {
    req.io.to(groupId.toString()).emit("group:join", {
      groupId,
      studentId: req.user._id,
    });
  }

  res.status(200).json({
    status: "success",
    data: group,
  });
});

// ======================================================================
// SEND QUIZ
// ======================================================================
// @desc    Doctor sends a quiz inside a group
// @route   POST /api/v1/chat/groups/:id/quiz
// @access  Private (Doctor)
// ======================================================================
exports.sendQuiz = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id;
  const { question, options, correctAnswer } = req.body;

  const quiz = await Quiz.create({
    question,
    options,
    correctAnswer,
    createdBy: req.user._id,
    group: groupId,
  });

  if (req.io) {
    req.io.to(groupId.toString()).emit("quiz:new", quiz);
  }

  res.status(201).json({
    status: "success",
    data: quiz,
  });
});

// ======================================================================
// ANSWER QUIZ
// ======================================================================
// @desc    Student answers a quiz
// @route   POST /api/v1/chat/quizzes/:id/answer
// @access  Private (Student)
// ======================================================================
exports.answerQuiz = asyncHandler(async (req, res, next) => {
  const quizId = req.params.id;
  const { optionIndex } = req.body;

  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { $push: { answers: { student: req.user._id, optionIndex } } },
    { new: true }
  );

  if (!quiz) {
    return next(new ApiError("Quiz not found", 404));
  }

  if (req.io) {
    req.io.to(quiz.group.toString()).emit("quiz:answer", {
      quizId,
      studentId: req.user._id,
      optionIndex,
    });
  }

  res.status(200).json({
    status: "success",
    data: quiz,
  });
});
