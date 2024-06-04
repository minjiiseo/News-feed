import express from 'express';
import authRouter from './auth.router.js';
import userRouter from './user.router.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);

export { apiRouter };
