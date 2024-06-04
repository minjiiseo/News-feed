import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { MIN_POST_LENGTH } from '../../constants/post.constant.js';

const schema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': MESSAGES.POSTS.COMMON.TITLE.REQUIRED,
    }),
    content: Joi.string().min(MIN_POST_LENGTH).required().messages({
        'any.required': MESSAGES.POSTS.COMMON.CONTENT.REQUIRED,
        'string.min': MESSAGES.POSTS.COMMON.CONTENT.MIN_LENGTH,
    }),
    image: Joi.string().uri().optional(), // Add this line
    price: Joi.number().optional(), // Add this line
    transactionType: Joi.string().valid('SELL', 'BUY').optional(),
});

export const createPostsValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        next(err);
    }
};
