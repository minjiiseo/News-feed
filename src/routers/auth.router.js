import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.js';
import requireRefreshToken from '../middlewares/require-refresh-token.middleware.js';
import { createResponse } from '../utils/response.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { HASH_SALT_ROUNDS } from '../constants/auth.constant.js';
import {
    ACCESS_TOKEN_SECRET_KEY,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_SECRET_KEY,
    REFRESH_TOKEN_EXPIRES_IN,
} from '../constants/env.constant.js';

const router = express.Router();

/*
    회원가입 API
*/
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

/*
    로그인 API
*/
router.post('/sign-in', signInValidator, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { username },
        });

        const isPasswordMatched =
            user && bcrypt.compareSync(password, user.password);

        if (!isPasswordMatched) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createResponse(
                        HTTP_STATUS.UNAUTHORIZED,
                        MESSAGES.AUTH.COMMON.UNAUTHORIZED
                    )
                );
        }

        const payload = { id: user.id };
        const tokenData = await generateAuthTokens(payload);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.AUTH.SIGN_IN.SECCEED,
                    tokenData
                )
            );
    } catch (err) {
        next(err);
    }
});

/*
    로그아웃 API
*/
router.post('/sign-out', requireRefreshToken, async (req, res, next) => {
    try {
        const user = req.user;
        await prisma.refreshToken.update({
            where: {
                userId: user.id,
            },
            data: {
                refreshToken: null,
            },
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(HTTP_STATUS.OK, MESSAGES.AUTH.SIGN_OUT.SECCEED, {
                    id: user.id,
                })
            );
    } catch (err) {
        next(err);
    }
});

/*
    토근 재발급 API
*/
router.post('/token', requireRefreshToken, async (req, res, next) => {
    try {
        const user = req.user;

        const payload = { id: user.id };
        const tokenData = await generateAuthTokens(payload);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.AUTH.TOKEN.SECCEED,
                    tokenData
                )
            );
    } catch (err) {
        next(err);
    }
});

const generateAuthTokens = async (payload) => {
    const userId = payload.id;

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);
    await prisma.refreshToken.upsert({
        where: { userId: userId },
        update: {
            refreshToken: hashedRefreshToken,
        },
        create: {
            userId: userId,
            refreshToken: hashedRefreshToken,
        },
    });

    return { accessToken, refreshToken };
};

export default router;
