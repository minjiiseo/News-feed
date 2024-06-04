import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { createResponse } from '../utils/response.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { updateUserValidator } from '../middlewares/validators/update-user-validator.js';

const router = express.Router();

/*
    내 정보 조회 API
*/
router.get('/me', async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await prisma.user.findUnique({
            where: { id: +id },
            omit: { password: true },
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(createResponse(HTTP_STATUS.OK, MESSAGES.USERS.READ_ME, user));
    } catch (err) {
        next(err);
    }
});

/*
    내 정보 수정 API
*/
router.patch('/me', updateUserValidator, async (req, res, next) => {
    try {
        const { id } = req.user;
        const updatedUser = req.body;

        const user = await prisma.user.update({
            where: { id: +id },
            data: updatedUser,
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.USERS.UPDATE_ME.SUCCEED,
                    user
                )
            );
    } catch (err) {
        next(err);
    }
});

export default router;
