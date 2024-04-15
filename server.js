require('./dbConfig/dbConfig.js');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const router = require('./router/userRouter.js');
const quizRouter = require('./router/quizRouter.js');

const app = express();

const port = process.env.PORT;

app.use(cors('*'));

app.use(fileUpload({
    useTempFiles: true,
    limits:{ fileSize: 5 * 1024 * 1024 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
    res.send("Welcome to the Eben Quiz App API");
})
app.use('/api/v1', router);
app.use('/user', quizRouter);


app.listen(port, () => {
    console.log(`Server up and running on port: ${port}`);
})