import CommentSchema from '../models/Comment.js';

export const getPostComments = async (req, res) => {
	try {
		const comments = await CommentSchema.find({ postId: req.params.postId }).populate(
			'user',
			'fullName avatarUrl',
		);
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: 'Could not got the comments' });
	}
};

export const addComment = async (req, res) => {
	try {
		const comment = new CommentSchema({
			text: req.body.text,
			user: req.userId,
			postId: req.params.postId,
		});
		const savedComment = await comment.save();
		const populatedComment = await CommentSchema.findById(savedComment._id).populate(
			'user',
			'fullName avatarUrl',
		);
		res.json(populatedComment);
	} catch (err) {
		console.error('Error while adding comment:', err);
		res.status(500).json({ message: "Error. Comment wasn't added", error: err.message });
	}
};

export const getLatestComments = async (req, res) => {
	try {
		const comments = await CommentSchema.find()
			.sort({ createdAt: -1 })
			.limit(3)
			.populate('user', 'fullName avatarUrl');
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: 'Could not got the comments' });
	}
};
