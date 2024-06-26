import express from 'express';
import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import postRouter from './posts.router.js';
import publicPostRouter from './posts-public.router.js';
import bookmarkRouter from './bookmark.router.js';
import requireAccessToken from '../middlewares/require-access-token.middleware.js';
import publicCommentRouter from './comment-public.router.js';
import commentRouter from './comment.router.js';
const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', requireAccessToken, userRouter);

apiRouter.use('/posts', publicPostRouter);
apiRouter.use('/posts', requireAccessToken, postRouter);

apiRouter.use('/comments', publicCommentRouter);
apiRouter.use('/comments', requireAccessToken, commentRouter);

apiRouter.use('/bookmarks', bookmarkRouter);
export { apiRouter };
