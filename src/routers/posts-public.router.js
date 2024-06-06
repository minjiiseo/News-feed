import express from 'express';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { prisma } from '../utils/prisma.util.js';

const postsRouter = express.Router();

// 게시물 목록 조회
postsRouter.get('/', async (req, res, next) => {
    try {
        let { sort } = req.query;

        sort = sort?.toLowerCase();

        if (sort !== 'desc' && sort !== 'asc') {
            sort = 'desc';
        }

        let data = await prisma.post.findMany({
            orderBy: {
                createdAt: sort,
            },
            include: {
                user: true,
            },
        });

        data = data.map((post) => ({
            id: post.id,
            userId: post.userId,
            title: post.title,
            content: post.content,
            price: post.price,
            image: post.image,
            status: post.status,
            transactionType: post.transactionType,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        }));

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.POSTS.READ_LIST.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// 게시물 상세 조회
postsRouter.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        let data = await prisma.post.findUnique({
            where: { id: +id },
            include: { user: true },
        });

        if (!data) {
            return res.status(HTTP_STATUS.OK).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.POSTS.COMMON.NOT_FOUND,
                data,
            });
        }

        data = {
            id: data.id,
            userId: data.userId,
            title: data.title,
            content: data.content,
            price: data.price,
            image: data.image,
            status: data.status,
            transactionType: data.transactionType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: MESSAGES.POSTS.READ_DETAIL.SUCCEED,
            data,
        });
    } catch (error) {
        next(error);
    }
});

export default postsRouter;
