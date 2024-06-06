import { Router } from 'express';
import { getCommentsByPost } from '../controllers/commentController.js';

const router = Router();

router.get('/:postId', getCommentsByPost);

export default router;
