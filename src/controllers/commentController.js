// src/controllers/commentController.js
import prisma from '../prisma.util.js';

// 댓글 작성
export const createComment = async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.id; // 인증된 사용자 ID

    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                content,
            },
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
    }
};

// 댓글 목록 조회
export const getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: { user: true },
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: '댓글 조회 중 오류가 발생했습니다.' });
    }
};

// 댓글 수정
export const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;  
    const userId = req.user.id; // 인증된 사용자 ID

    try {
        const comment = await prisma.comment.updateMany({
            where: { id: Number(commentId), userId },
            data: { content },
        });

        if (comment.count === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없거나 권한이 없습니다.' });
        }

        res.status(200).json({ message: '댓글이 수정되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '댓글 수정 중 오류가 발생했습니다.' });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id; // 인증된 사용자 ID

    try {
        const comment = await prisma.comment.deleteMany({
            where: { id: Number(commentId), userId },
        });

        if (comment.count === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없거나 권한이 없습니다.' });
        }

        res.status(200).json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
    }
};
