import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

const schema = Joi.object({
    email: Joi.string().email().messages({
        'string.email': MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
    }),
    nickname: Joi.string(),
    phoneNumber: Joi.string(),
    profile: Joi.string(),
})
    .min(1)
    .messages({
        'object.min': MESSAGES.USERS.UPDATE_ME.NO_BODY_DATA,
    });

export const updateUserValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        next(err);
    }
};
