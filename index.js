import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';

import {
	commentValidation,
	loginValidation,
	postCreateValidation,
	registerValidation,
} from './validations/validations.js';

import { checkAuth, handleValidationError } from './utils/index.js';
import { UserController, PostController, CommentController } from './controllers/index.js';

dotenv.config();
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log('DB is ok'))
	.catch((e) => console.log('DB Error', e));

const app = express();

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		if (!fs.existsSync('uploads')) {
			fs.mkdirSync('uploads');
		}
		cb(null, 'uploads');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationError, UserController.login);
app.post('/auth/register', registerValidation, handleValidationError, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

app.get('/posts', PostController.getAll);
app.get('/posts/sort', PostController.sort);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/tags/:tag', PostController.filterByTag);
app.post('/posts', checkAuth, postCreateValidation, handleValidationError, PostController.create);
app.get('/posts/:id', PostController.getOne);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, handleValidationError, PostController.update);

app.get('/posts/:postId/comments', CommentController.getPostComments);
app.get('/comments/latest', CommentController.getLatestComments);
app.post('/posts/:postId/comments', checkAuth, commentValidation, CommentController.addComment);

app.listen(process.env.PORT || 4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server OK');
});
