import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { MIN_POST_LENGTH } from '../../constants/post.constant.js';

const schema = Joi.object({
    title: Joi.string(),
    content: Joi.string().min(MIN_POST_LENGTH).messages({
        'string.min': MESSAGES.POSTS.COMMON.CONTENT.MIN_LENGTH,
    }),
    image: Joi.string().uri().optional(),
    price: Joi.number().optional(),
    transactionType: Joi.string().valid('SELL', 'BUY').optional(),
})
    .min(1)
    .messages({
        'object.min': MESSAGES.POSTS.UPDATE.NO_BODY_DATA,
    });

export const updatePostsValidator = async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (err) {
        next(err);
    }
};
