import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { MIN_PASSWORD_LENGTH } from '../../constants/auth.constant.js';

const schema = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
        'string.email': MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
    }),
    password: Joi.string().required().min(MIN_PASSWORD_LENGTH).messages({
        'any.required': MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED,
        'string.min': MESSAGES.AUTH.COMMON.PASSWORD.MIN_LENGTH,
    }),
});

export const signInValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        next(err);
    }
};
