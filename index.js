import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import {
	loginValidation,
	postCreateValidation,
	registerValidation,
} from './validations/validations.js';

import { checkAuth, handleValidationError } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js';

mongoose
	.connect(
		'mongodb+srv://yuriizatoka:919091Ua@cluster0.liip9qe.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0',
	)
	.then(() => console.log('DB is ok'))
	.catch((e) => console.log('DB Error', e));

const app = express();

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// app.get('/', (req, res) => {
// 	res.send('3434 Hello world!');
// });

// app.post('/auth/login', (req, res) => {
// 	console.log(req.body);

// 	const token = jwt.sign(
// 		{
// 			email: req.body.email,
// 			fullName: 'Yurii Zatoka',
// 		},
// 		'123',
// 	);
// 	res.json({
// 		success: true,
// 		token,
// 	});
// });

app.post('/auth/login', loginValidation, handleValidationError, UserController.login);
app.post('/auth/register', registerValidation, handleValidationError, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

app.get('/posts', PostController.getAll);
app.post('/posts', checkAuth, postCreateValidation, handleValidationError, PostController.create);
app.get('/posts/:id', PostController.getOne);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, handleValidationError, PostController.update);

app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server OK');
});
