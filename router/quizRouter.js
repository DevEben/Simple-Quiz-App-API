const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzes,
    createQuestion,
    getQuestions,
    createOption,
    getOptions,
    createUserResponse,
    getUserResponses,
    createQuizWithGeneratedQuestions
} = require('../controllers/quizController');

// Routes for quizzes
router.post('/quizzes', createQuiz);
router.get('/quizzes', getQuizzes);

// Routes for questions
router.post('/questions', createQuestion);
router.get('/questions', getQuestions);

// Routes for options
router.post('/options/:questionId', createOption);
router.get('/options', getOptions);

// Routes for user responses
router.post('/user-responses', createUserResponse);
router.get('/user-responses', getUserResponses);

// Route for generating a quiz with generated questions
router.post('/quizzes/generate', createQuizWithGeneratedQuestions);


module.exports = router;
