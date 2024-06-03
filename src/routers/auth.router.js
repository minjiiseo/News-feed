import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.js';
import { createResponse } from '../utils/response.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { HASH_SALT_ROUNDS } from '../constants/auth.constant.js';

const router = express.Router();

router.post('/sign-up', signUpValidator, async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existedUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        //ID or Email이 중복되는 경우
        if (existedUser) {
            return res
                .status(HTTP_STATUS.CONFLICT)
                .json(
                    createResponse(
                        HTTP_STATUS.CONFLICT,
                        MESSAGES.AUTH.COMMON.DUPLICATED
                    )
                );
        }

        const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);
        const formattedData = { ...req.body, password: hashedPassword };
        delete formattedData.passwordConfirm;
        console.log(formattedData);
        const data = await prisma.user.create({
            data: formattedData,
        });

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                createResponse(
                    HTTP_STATUS.CREATED,
                    MESSAGES.AUTH.SIGN_UP.SECCEED,
                    data
                )
            );
    } catch (err) {
        next(err);
    }
});

export default router;
