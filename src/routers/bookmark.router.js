import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import requireAccessToken from '../middlewares/require-access-token.middleware.js';
import { createResponse } from '../utils/response.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

const router = express.Router();

/**
 * 게시글 북마크 개수 조회 API
 */
router.get('/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!(await isPostExist(postId))) {
            return res
                .status(HTTP_STATUS.CONFLICT)
                .json(
                    createResponse(
                        HTTP_STATUS.CONFLICT,
                        MESSAGES.POSTS.COMMON.NOT_FOUND
                    )
                );
        }

        const bookmarkCount = await prisma.bookmark.count({
            where: { postId: +postId },
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.BOOKMARK.READ_COUNT.SUCCEED,
                    bookmarkCount
                )
            );
    } catch (err) {
        next(err);
    }
});

/**
 *  북마크 추가/삭제 API
 */
router.post('/:postId', requireAccessToken, async (req, res, next) => {
    const { id } = req.user;
    const { postId } = req.params;

    if (!(await isPostExist(postId))) {
        return res
            .status(HTTP_STATUS.CONFLICT)
            .json(
                createResponse(
                    HTTP_STATUS.CONFLICT,
                    MESSAGES.POSTS.COMMON.NOT_FOUND
                )
            );
    }

    const bookmark = await prisma.bookmark.findFirst({
        where: {
            userId: +id,
            postId: +postId,
        },
    });

    /**
     * 북마크가 이미 존재할 경우 삭제
     */
    if (bookmark) {
        const deletedBookmark = await prisma.bookmark.delete({
            where: {
                postId_userId: {
                    userId: +id,
                    postId: +postId,
                },
            },
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.BOOKMARK.DELETE.SUCCEED,
                    deletedBookmark
                )
            );
    }

    /**
     * 북마크가 존재하지 않을 경우 생성
     */
    const createdBookmark = await prisma.bookmark.create({
        data: {
            postId: +postId,
            userId: id,
        },
    });

    return res
        .status(HTTP_STATUS.OK)
        .json(
            createResponse(
                HTTP_STATUS.OK,
                MESSAGES.BOOKMARK.CREATE.SUCCEED,
                createdBookmark
            )
        );
});

const isPostExist = async (postId) => {
    const existedPost = await prisma.post.findUnique({
        where: { id: +postId },
    });

    if (!existedPost) {
        return false;
    }

    return true;
};
export default router;
