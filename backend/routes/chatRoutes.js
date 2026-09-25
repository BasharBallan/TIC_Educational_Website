const express = require("express");
const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  startConversation,
  sendMessage,
  createGroup,
  joinGroup,
  sendQuiz,
  answerQuiz,
} = require("../services/chatService");

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: APIs for chat system (conversations, groups, messages, quizzes)
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/chat/conversations/start:
 *   post:
 *     summary: Start a new conversation (Student ↔ Doctor)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     description: Starts a new conversation or returns existing one between student and doctor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - doctorId
 *             properties:
 *               studentId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation started successfully
 */
router.post("/conversations/start", startConversation);

/**
 * @swagger
 * /api/v1/chat/messages/send:
 *   post:
 *     summary: Send a message inside a conversation or group
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     description: Allows student or doctor to send a message (text, image, file, video, quiz).
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post("/messages/send", sendMessage);

/**
 * @swagger
 * /api/v1/chat/groups/create:
 *   post:
 *     summary: Create a new group (Doctor only)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     description: Doctor creates a new educational group with invite link.
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post("/groups/create", allowedTo("doctor"), createGroup);

/**
 * @swagger
 * /api/v1/chat/groups/{id}/join:
 *   post:
 *     summary: Join a group via invite link (Student only)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Group ID
 *     responses:
 *       200:
 *         description: Student joined group successfully
 */
router.post("/groups/:id/join", allowedTo("student"), joinGroup);

/**
 * @swagger
 * /api/v1/chat/groups/{id}/quiz:
 *   post:
 *     summary: Send a quiz inside a group (Doctor only)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Group ID
 *     responses:
 *       201:
 *         description: Quiz sent successfully
 */
router.post("/groups/:id/quiz", allowedTo("doctor"), sendQuiz);

/**
 * @swagger
 * /api/v1/chat/quizzes/{id}/answer:
 *   post:
 *     summary: Answer a quiz (Student only)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz answered successfully
 */
router.post("/quizzes/:id/answer", allowedTo("student"), answerQuiz);

module.exports = router;
