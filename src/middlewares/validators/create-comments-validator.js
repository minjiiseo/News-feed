// create-comments-validator.js
import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

const schema = Joi.object({
    postId: Joi.number().required().messages({
        'any.required': MESSAGES.COMMENTS.COMMON.NOT_FOUND,
    }),
    content: Joi.string().min(1).required().messages({
        'any.required': MESSAGES.COMMENTS.COMMON.CONTENT.REQUIRED,
        'string.min': MESSAGES.COMMENTS.COMMON.CONTENT.MIN_LENGTH,
    }),
});

export const createCommentsValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: err.details.map((detail) => detail.message).join(', '),
        });
    }
};
