import express from 'express';
import { createCommentsValidator } from '../middlewares/validators/create-comments-validator.js';
import { updateCommentsValidator } from '../middlewares/validators/update-comments-validator.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { prisma } from '../utils/prisma.util.js';

const commentsRouter = express.Router();

// 댓글 작성
commentsRouter.post('/', createCommentsValidator, async (req, res, next) => {
    try {
        const user = req.user;
        const { postId, content } = req.body;
        const userId = user.id;

        const data = await prisma.comment.create({
            data: {
                postId,
                userId,
                content,
            },
        });

        return res.status(HTTP_STATUS.CREATED).json({
            status: HTTP_STATUS.CREATED,
            message: MESSAGES.COMMENTS.CREATE.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// 댓글 목록 조회
commentsRouter.get('/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params;

        const comments = await prisma.comment.findMany({
            where: { postId: +postId },
            include: {
                user: true,
            },
        });

        const data = comments.map((comment) => ({
            postId: comment.postId,
            username: comment.user.username,
            content: comment.content,
            updatedAt: comment.updatedAt,
        }));

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.COMMENTS.READ_LIST.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// 댓글 수정
commentsRouter.put(
    '/:postId/:id',
    updateCommentsValidator,
    async (req, res, next) => {
        try {
            const user = req.user;
            const userId = user.id;
            const { postId, id } = req.params;
            const { content } = req.body;

            let existedComment = await prisma.comment.findUnique({
                where: { id: +id, postId: +postId, userId },
            });

            if (!existedComment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    status: HTTP_STATUS.NOT_FOUND,
                    message: MESSAGES.COMMENTS.COMMON.NOT_FOUND,
                });
            }

            const data = await prisma.comment.update({
                where: { id: +id, postId: +postId, userId },
                data: { content },
            });

            return res.status(HTTP_STATUS.OK).json({
                status: HTTP_STATUS.OK,
                message: MESSAGES.COMMENTS.UPDATE.SUCCEED,
                data,
            });
        } catch (error) {
            next(error);
        }
    }
);

// 댓글 삭제
commentsRouter.delete('/:postId/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user.id;
        const { postId, id } = req.params;

        let existedComment = await prisma.comment.findUnique({
            where: { id: +id, postId: +postId, userId },
        });

        if (!existedComment) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.COMMENTS.COMMON.NOT_FOUND,
            });
        }

        const data = await prisma.comment.delete({
            where: { id: +id, postId: +postId, userId },
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.COMMENTS.DELETE.SUCCEED,
            data: { id: data.id },
        });
    } catch (error) {
        next(error);
    }
});

export default commentsRouter;
