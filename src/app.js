import express from 'express';
import { SERVER_PORT } from './constants/env.constant.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health-check', (req, res) => {
    return res.status(200).send(`I'm Healthy`);
});

app.use(errorHandler);

app.listen(SERVER_PORT, () => {
    console.log(SERVER_PORT, '포트로 서버가 열렸어요!');
});
