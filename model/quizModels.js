// Import mongoose
const mongoose = require('mongoose');

// Define Schema for Option
const optionSchema = new mongoose.Schema({
    option: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
    }
});

// Define Schema for Question
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [optionSchema], // Array of option objects
    correctOption: {
        type: Number,
        required: true
    }
});

// Define Schema for Quiz
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    questions: [questionSchema] // Array of question objects
});

// Define Schema for User Response
const userResponseSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    selectedOptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option'
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
});

// Define models based on schemas
const Option = mongoose.model('Option', optionSchema);
const Question = mongoose.model('Question', questionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const UserResponse = mongoose.model('UserResponse', userResponseSchema);


// Export models
module.exports = {
    Option,
    Question,
    Quiz,
    UserResponse
};
