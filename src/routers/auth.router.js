import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.js';
import requireRefreshToken from '../middlewares/require-refresh-token.middleware.js';
import { createResponse } from '../utils/response.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import {
    AUTH_MESSAGE_NUMBER,
    HASH_SALT_ROUNDS,
} from '../constants/auth.constant.js';
import {
    ACCESS_TOKEN_SECRET_KEY,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_SECRET_KEY,
    REFRESH_TOKEN_EXPIRES_IN,
    SMTP_USER,
} from '../constants/env.constant.js';
import { smtpTransport } from '../../config/email.js';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 180, checkperiod: 600 }); // init

/*
    회원가입 API
*/
router.post('/sign-up', signUpValidator, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existedUser = await prisma.user.findFirst({
            where: { email },
        });

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
    이메일 인증 메일 전송 API
*/
router.post('/send-verification', async (req, res, next) => {
    try {
        const { email } = req.body;

        const authMessage = generateRandomCode(AUTH_MESSAGE_NUMBER);
        const mailOptions = {
            from: SMTP_USER,
            to: email,
            subject: '[News feed] 이메일 확인 인증코드 안내', // 이메일 제목
            text: `아래 인증코드를 확인하여 이메일 주소 인증을 완료해 주세요.\n
            연락처 이메일 : ${email}\n
            인증 코드 : ${authMessage}`,
        };

        await smtpTransport.sendMail(mailOptions, (error, response) => {
            if (error) {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                    createResponse(
                        HTTP_STATUS.INTERNAL_SERVER_ERROR,
                        MESSAGES.AUTH.EMAIL_VERIFICATION.FAILURE
                    )
                );
            }
            smtpTransport.close();
        });
        cache.set(email, authMessage);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.AUTH.EMAIL_VERIFICATION.SUCCESS
                )
            );
    } catch (err) {
        next(err);
    }
});

/*
    이메일 인증 코드 검증 API
*/
router.post('/verify-email', async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const cachedCode = cache.get(email);

        if (!cachedCode || cachedCode !== code) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json(
                    createResponse(
                        HTTP_STATUS.BAD_REQUEST,
                        MESSAGES.AUTH.EMAIL_VERIFICATION_CODE.FAILURE
                    )
                );
        }

        cache.del(email);
        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.AUTH.EMAIL_VERIFICATION_CODE.SUCCESS
                )
            );
    } catch (err) {
        next(err);
    }
});

/*
    이메일 중복 검증 API
*/
router.get('/check-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const existedEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existedEmail) {
            return res
                .status(HTTP_STATUS.CONFLICT)
                .json(
                    createResponse(
                        HTTP_STATUS.CONFLICT,
                        MESSAGES.AUTH.EMAIL_CHECK.DUPLICATE
                    )
                );
        }

        return res
            .status(HTTP_STATUS.OK)
            .json(
                createResponse(
                    HTTP_STATUS.OK,
                    MESSAGES.AUTH.EMAIL_CHECK.AVAILABLE
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
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
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

        return res.status(HTTP_STATUS.OK).json(
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

function generateRandomCode(length) {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

export default router;
