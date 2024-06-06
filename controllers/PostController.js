import PostModel from '../models/Post.js';
import CommentSchema from '../models/Comment.js';

export const getAll = async (req, res) => {
	try {
		const posts = await PostModel.find().populate('user', 'fullName email avatarUrl').exec();

		const postsWithCommentsCount = await Promise.all(
			posts.map(async (post) => {
				const commentsCount = await CommentSchema.countDocuments({ postId: post._id });
				return { ...post.toObject(), commentsCount };
			}),
		);

		res.json(postsWithCommentsCount);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not got the articles',
		});
	}
};

export const getLastTags = async (req, res) => {
	try {
		const posts = await PostModel.find().limit(5).exec();

		const tags = posts.map((obj) => obj.tags).flat();

		const tagCounts = tags.reduce((acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		}, {});

		const sortedTags = Object.keys(tagCounts)
			.sort((a, b) => tagCounts[b] - tagCounts[a])
			.slice(0, 7);

		res.json(sortedTags);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not got the tags',
		});
	}
};

export const getOne = async (req, res) => {
	try {
		const postId = req.params.id;
		const doc = await PostModel.findOneAndUpdate(
			{
				_id: postId,
			},
			{
				$inc: { viewsCount: 1 },
			},
			{
				returnDocument: 'after',
			},
		).populate('user');
		const commentsCount = await CommentSchema.countDocuments({ postId: postId });

		if (!doc) {
			return res.status(404).json({
				message: 'The article was not found',
			});
		}

		res.json({ ...doc.toObject(), commentsCount });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not got the articles',
		});
	}
};

export const remove = async (req, res) => {
	try {
		const postId = req.params.id;

		const doc = await PostModel.findOneAndDelete({
			_id: postId,
		});

		if (!doc) {
			return res.status(404).json({
				message: 'The article was not found',
			});
		}
		res.json({
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not delete the article',
		});
	}
};

export const create = async (req, res) => {
	try {
		const doc = new PostModel({
			title: req.body.title,
			text: req.body.text,
			tags: req.body.tags,
			imageUrl: req.body.imageUrl,
			user: req.userId,
		});

		const post = await doc.save();

		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not added the article',
		});
	}
};

export const update = async (req, res) => {
	try {
		const postId = req.params.id;
		const doc = await PostModel.updateOne(
			{
				_id: postId,
			},
			{
				title: req.body.title,
				text: req.body.text,
				tags: req.body.tags,
				imageUrl: req.body.imageUrl,
				user: req.userId,
			},
		);

		if (!doc) {
			return res.status(404).json({
				message: 'The article was not found',
			});
		}
		res.json({
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Could not update the article',
		});
	}
};

export const sort = async (req, res) => {
	const { sortBy, tag } = req.query;

	let sortCriteria;
	if (sortBy === 'new') {
		sortCriteria = { createdAt: -1 };
	} else if (sortBy === 'popular') {
		sortCriteria = { viewsCount: -1 };
	} else {
		sortCriteria = {};
	}

	try {
		let query = {};
		if (tag) {
			query = { tags: tag };
		}
		const posts = await PostModel.find(query)
			.sort(sortCriteria)
			.populate('user', 'fullName email avatarUrl')
			.exec();

		const postsWithCommentsCount = await Promise.all(
			posts.map(async (post) => {
				const commentsCount = await CommentSchema.countDocuments({ postId: post._id });
				return { ...post.toObject(), commentsCount };
			}),
		);
		res.json(postsWithCommentsCount);
	} catch (error) {
		res.status(500).json({ message: 'Could not retrieve posts', error });
	}
};

export const filterByTag = async (req, res) => {
	try {
		const tag = req.params.tag;
		const posts = await PostModel.find({ tags: tag });
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: 'Error when receiving posts' });
	}
};
