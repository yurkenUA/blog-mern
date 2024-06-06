import { body } from 'express-validator';

export const loginValidation = [
	body('email', 'invalid mail format').isEmail(),
	body('password', 'password must be at least 5 characters').isLength({ min: 5 }),
];

export const registerValidation = [
	body('email', 'invalid mail format').isEmail(),
	body('password', 'password must be at least 5 characters').isLength({ min: 5 }),
	body('fullName', 'Enter your name').isLength({ min: 3 }),
	body('avatarUrl', 'Bad URL').optional().isURL(),
];

export const postCreateValidation = [
	body('title', 'Enter the title of the artcile').isLength({ min: 3 }).isString(),
	body('text', 'Enter the main text of the artcile').isLength({ min: 10 }).isString(),
	body('tags', "Wrong tag's format (indicate an array)").optional().isArray(),
	body('imageUrl', "Bad image's URL").optional().isString(),
];

export const commentValidation = [
	body('text', 'Enter the text of the comment').isLength({ min: 3 }).isString(),
];
