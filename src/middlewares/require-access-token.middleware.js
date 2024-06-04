import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { createResponse } from '../utils/response.util.js';
import { ACCESS_TOKEN_SECRET_KEY } from '../constants/env.constant.js';
import { TOKEN_TYPE } from '../constants/auth.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

export default async function (req, res, next) {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createResponse(
                        HTTP_STATUS.UNAUTHORIZED,
                        MESSAGES.AUTH.COMMON.JWT.NO_TOKEN
                    )
                );
        }

        const [tokenType, token] = authorization.split(' ');

        if (tokenType !== TOKEN_TYPE) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createResponse(
                        HTTP_STATUS.UNAUTHORIZED,
                        MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED_TYPE
                    )
                );
        }

        if (!token) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createResponse(
                        HTTP_STATUS.UNAUTHORIZED,
                        MESSAGES.AUTH.COMMON.JWT.NO_TOKEN
                    )
                );
        }

        let payload;
        try {
            payload = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
        } catch (error) {
            switch (error.name) {
                case 'TokenExpiredError':
                    return res
                        .status(HTTP_STATUS.UNAUTHORIZED)
                        .json(
                            createResponse(
                                HTTP_STATUS.UNAUTHORIZED,
                                MESSAGES.AUTH.COMMON.JWT.EXPIRED
                            )
                        );
                default:
                    return res
                        .status(HTTP_STATUS.UNAUTHORIZED)
                        .json(
                            createResponse(
                                HTTP_STATUS.UNAUTHORIZED,
                                MESSAGES.AUTH.COMMON.JWT.INVALID
                            )
                        );
            }
        }

        const { id } = payload;
        const user = await prisma.user.findUnique({
            where: { id: +id },
            omit: { password: true },
        });

        if (!user) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json(
                    createResponse(
                        HTTP_STATUS.UNAUTHORIZED,
                        MESSAGES.AUTH.COMMON.JWT.NO_USER
                    )
                );
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
