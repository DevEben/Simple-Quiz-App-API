// Import node-fetch
const fetch = require('node-fetch');
// Import necessary models
const { Quiz, Question, Option, UserResponse } = require('../model/quizModels');
require('dotenv').config();



// Function to generate multiple-choice options
const generateOptions = (question) => {

    // Split the question into words
    const words = question.split(' ');

    // Extract key terms or concepts from the question
    const keyTerms = words.filter(word => word.length > 3); // Example: Consider words with more than 3 characters as key terms

    // Generate options based on the key terms
    const options = [];

    // Add correct answer (first letter of each key term)
    let correctAnswer = '';
    for (let i = 0; i < keyTerms.length; i++) {
        correctAnswer += keyTerms[i][0].toUpperCase(); // Take the first letter of each key term
    }
    options.push(correctAnswer);

    // Generate incorrect options by shuffling the order of letters in the correct answer
    const shuffledCorrectAnswer = correctAnswer.split('').sort(() => Math.random() - 0.5).join('');
    options.push(shuffledCorrectAnswer);

    // Add two more random incorrect options
    for (let i = 0; i < 2; i++) {
        let randomOption = '';
        for (let j = 0; j < correctAnswer.length; j++) {
            const randomCharCode = Math.floor(Math.random() * 26) + 65; // Generate random ASCII code for letters (A-Z)
            randomOption += String.fromCharCode(randomCharCode);
        }
        options.push(randomOption);
    }

    // Shuffle the options array to randomize the order
    options.sort(() => Math.random() - 0.5);

    return options;
}


// Function to generate quiz questions with options using GPT-3
const generateQuizQuestionsWithOptions = async (topic, numQuestions) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const prompt = `Generate a quiz question about ${topic}.`;

    const questionsWithOptions = [];

    try {
        for (let i = 0; i < numQuestions; i++) {
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo-instruct',
                    prompt: prompt,
                    max_tokens: 100
                })
            });

            const data = await response.json();

            // Check if data.choices is undefined or empty
            if (!data.choices || data.choices.length === 0) {
                console.error('Error: No choices found in API response');
                continue; // Skip to the next iteration
            }

            const question = data.choices[0].question.trim();

            // Generate options based on the question
            const options = generateOptions(question);

            questionsWithOptions.push({ question, options });
        }

        return questionsWithOptions;
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        return [];
    }
}



// Controller for creating a quiz with generated questions and options
const createQuizWithGeneratedQuestions = async (req, res) => {
    const topic = req.body.topic;
    const numQuestions = 10; // Generate 10 questions

    try {
        const questionsWithOptions = await generateQuizQuestionsWithOptions(topic, numQuestions);

        // Create quiz with generated questions and options
        const quiz = await Quiz.create({
            title: `Quiz on ${topic}`,
            questions: questionsWithOptions.map(item => ({
                question: item.question,
                options: item.options.map(optionText => ({ option: optionText })),
                correctOption: item.options.findIndex(optionText => optionText === item.options[0])
            }))
        });

        return res.status(201).json({
            message: "Quiz successfully generated with options",
            data: quiz
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create quiz with generated questions' + error.message });
    }
}



// Function to create a new quiz manually
const createQuiz = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({
                message: "title was not provided"
            })
        }

        const quiz = await Quiz.create(req.body);
        if (!quiz) {
            return res.status(400).json({
                message: "quiz was not created"
            })
        };

        return res.status(201).json({
            message: "quiz created successfully",
            data: quiz
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create quiz' + error.message });
    }
}


// Function to get all the created quiz 
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        if (!quizzes.length <= 0) {
            return res.status(404).json({
                message: "No quiz found"
            })
        }
        return res.status(200).json({
            message: "Quiz successfully fetched",
            data: quizzes
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch quizzes' + error.message });
    }
}


// Function to create a Question for the quiz
async function createQuestion(req, res) {
    try {
        const { question, options, correctOption } = req.body;
        if (!question || !options || !correctOption) {
            return res.status(400).json({
                message: "Please provide the question, options and correctOption"
            })
        }
        const Newquestion = await Question.create(req.body);
        if (!Newquestion) {
            return res.status(400).json({
                message: "Quiz question was not created"
            })
        }
        return res.status(201).json({
            message: "Quiz question successfully created!",
            data: Newquestion
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create question' + error.message });
    }
}


//Function to get all questions
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        if (questions.length <= 0) {
            return res.status(404).json({
                message: "No questions found in the database."
            })
        }
        return res.status(200).json({
            message: "questions successfully fetched!",
            data: questions
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch questions' + error.message });
    }
}


// Function to create Options for the questions
async function createOption(req, res) {
    try {
        const questionId = req.params.questionId;
        const { option } = req.body;
        if (!option) {
            return res.status(404).json({
                message: "No options provided for the question."
            });
        }
        const Newoption = await Option.create({
            option: option,
            questionId: questionId,
        });
        return res.status(201).json({
            message: "option created successfully.",
            data: Newoption
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create option' + error.message });
    }
}


//Function to get all the options 
const getOptions = async (req, res) => {
    try {
        const options = await Option.find();
        if (!options.length <= 0) {
            return res.status(404).json({
                message: "No options found!"
            });
        }
        return res.status(200).json({
            message: "options fetched successfully",
            data: options
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch options' + error.message });
    }
}



// Function to get the User Response to the quiz
async function createUserResponse(req, res) {
    try {
        const userResponse = await UserResponse.create(req.body);
        return res.status(201).json({
            message: "User response created successfully!",
            data: userResponse
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user response' + error.message });
    }
}




const getUserResponses = async (req, res) => {
    try {
        const userResponses = await UserResponse.find();
        if (!userResponses) {
            return res.status(404).json({
                message: "User response not found",
            })
        }
        return res.status(200).json({
            message: "user response fetched successfully!",
            data: userResponses
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user responses' + error.message });
    }
}




module.exports = {
    createQuizWithGeneratedQuestions,
    createQuiz,
    getQuizzes,
    createQuestion,
    getQuestions,
    createOption,
    getOptions,
    createUserResponse,
    getUserResponses
};

