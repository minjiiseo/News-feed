import { Router } from 'express';
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
} from '../controllers/commentController.js';

const router = Router();

router.post('/', createComment);
router.patch('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;
