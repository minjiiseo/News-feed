import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { MIN_PASSWORD_LENGTH } from '../../constants/auth.constant.js';

const schema = Joi.object({
    username: Joi.string().required().messages({
        'any.required': MESSAGES.AUTH.COMMON.USERNAME.REQUIRED,
    }),
    email: Joi.string().email().required().messages({
        'any.required': MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
        'string.email': MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
    }),
    password: Joi.string().required().min(MIN_PASSWORD_LENGTH).messages({
        'any.required': MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED,
        'string.min': MESSAGES.AUTH.COMMON.PASSWORD.MIN_LENGTH,
    }),
    passwordConfirm: Joi.string()
        .required()
        .min(MIN_PASSWORD_LENGTH)
        .valid(Joi.ref('password'))
        .messages({
            'any.required': MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQUIRED,
            'any.only':
                MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NOT_MATCHED_WITH_PASSWORD,
        }),
    nickname: Joi.string().required().messages({
        'any.required': MESSAGES.AUTH.COMMON.NICKNAME.REQUIRED,
    }),
    phoneNumber: Joi.string().required().messages({
        'any.required': MESSAGES.AUTH.COMMON.PHONE_NUMBER.REQUIRED,
    }),
    profile: Joi.string(),
});

export const signUpValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        next(err);
    }
};
