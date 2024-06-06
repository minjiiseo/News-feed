import express from 'express';
import Joi from 'joi';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { createPostsValidator } from '../middlewares/validators/create-posts-validator.js';
import { prisma } from '../utils/prisma.util.js';
import { updatePostsValidator } from '../middlewares/validators/update-posts-validator.js';

const postsRouter = express.Router();

// 게시물 생성
postsRouter.post('/', createPostsValidator, async (req, res, next) => {
    try {
        const user = req.user;
        const { title, content, image, price, transactionType } = req.body;
        const userId = user.id;

        const data = await prisma.post.create({
            data: {
                userId,
                title,
                content,
                image,
                price,
                transactionType,
            },
        });

        return res.status(HTTP_STATUS.CREATED).json({
            status: HTTP_STATUS.CREATED,
            message: MESSAGES.POSTS.CREATE.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// 게시물 수정
postsRouter.put('/:id', updatePostsValidator, async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user.id;

        const { id } = req.params;

        const { title, content, image, price, transactionType } = req.body;

        let existedPosts = await prisma.post.findUnique({
            where: { id: +id, userId },
        });

        if (!existedPosts) {
            return res.status(HTTP_STATUS.OK).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.POSTS.COMMON.NOT_FOUND,
            });
        }

        const data = await prisma.post.update({
            where: { id: +id, userId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(image && { image }),
                ...(price && { price }),
                ...(transactionType && { transactionType }),
            },
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.POSTS.UPDATE.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// 게시물 삭제
postsRouter.delete('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user.id;

        const { id } = req.params;

        let existedPosts = await prisma.post.findUnique({
            where: { id: +id, userId },
        });

        if (!existedPosts) {
            return res.status(HTTP_STATUS.OK).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.POSTS.COMMON.NOT_FOUND,
            });
        }

        const data = await prisma.post.delete({ where: { id: +id, userId } });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.POSTS.DELETE.SUCCEED,
            data: { id: data.id },
        });
    } catch (error) {
        next(error);
    }
});

postsRouter.patch('/:id/status', async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user.id;

        const { id } = req.params;
        const { status } = req.body;

        // status만 업데이트할 것이므로 유효성 검사를 직접 수행
        const schema = Joi.object({
            status: Joi.string()
                .valid('FOR_SALE', 'RESERVED', 'SOLD_OUT')
                .required(),
        });

        try {
            await schema.validateAsync({ status });
        } catch (err) {
            return res.status(400).json({
                status: 400,
                message: err.details.map((detail) => detail.message).join(', '),
            });
        }

        let existedPosts = await prisma.post.findUnique({
            where: { id: +id, userId },
        });

        if (!existedPosts) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.POSTS.COMMON.NOT_FOUND,
            });
        }

        const data = await prisma.post.update({
            where: { id: +id, userId },
            data: { status },
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.POSTS.UPDATE.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

export default postsRouter;
