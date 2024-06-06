import { Router } from 'express';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { prisma } from '../utils/prisma.util.js';
const router = Router();

/**
 * 댓글 목록 조회 API
 *  */
router.get('/:postId', async (req, res, next) => {
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

export default router;
