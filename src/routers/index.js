import express from 'express';
import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import requireAccessToken from '../middlewares/require-access-token.middleware.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', requireAccessToken, userRouter);

export { apiRouter };
