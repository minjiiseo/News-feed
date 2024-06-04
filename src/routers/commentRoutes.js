import { Router } from 'express';
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
} from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();  

router.post('/comments', verifyToken, createComment);
router.get('/comments/:postId', getCommentsByPost);
router.patch('/comments/:commentId', verifyToken, updateComment);
router.delete('/comments/:commentId', verifyToken, deleteComment);

export default router;
