import prisma from '../prisma-client';
import express, {type Request, type Response} from 'express';
import { param, body } from 'express-validator';
import handleValidationErrors from '../utils/routeValidator';

const getAllBooks = async (req: Request, res: Response) => {
    const books = await prisma.book.findMany({
        include: {
            author: true
        }
    });

    res.json(books);
};

const addBookValidation = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 250 })
        .withMessage('Title must be between 3 and 250 characters')
        .trim()
        .escape(),
    body('authorId')
        .isInt({ gt: 0 })
        .withMessage('Select a valid author')
        .toInt()
        .trim()
];

const addBook = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { title, authorId } = req.body;
        const authorIdNum = Number(authorId);

        const authorExists = await prisma.author.findUnique({
            where: {
                id: authorIdNum
            }
        });

        if (!authorExists) {
            return res.status(404).json({
                message: "Author does not exist"
            });
        }

        const book = await prisma.book.create({
            data: {
                title: title,
                authorId: authorIdNum
            },
            include: {
                author: true,
            }
        });

        res.status(201).json({
            message: "Successfully created book",
            book: {
                ...book,
                author: book.author
            }
        });
    } catch(error) {
        console.error("Error adding book: ", error);
        
        res.status(500).json({
            message: "Failed to add book"
        });
    }
};

const updateBookValidation = [ 
    param('id')
        .isInt({ gt: 0 })
        .withMessage('Enter a valid book ID')
        .toInt()
        .trim()
        .escape(),
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 250 })
        .withMessage('Title must be between 3 and 250 characters')
        .trim()
        .escape(),
    body('authorId')
        .isInt({ gt: 0 })
        .withMessage('Select a valid author')
        .toInt()
        .trim()
];

const updateBook = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { id }  = req.params;
        const { title, authorId } = req.body;
        const bookId = Number(id);
        const authorIdNum = Number(authorId);

        const bookExists = await prisma.book.findUnique({
            where: {
                id: bookId
            }
        });

        if (!bookExists) {
            return res.status(404).json({
                message: "Book does not exist"
            });
        }

        await prisma.book.update({
            data: {
                title,
                authorId: authorIdNum
            },
            where: {
                id: bookId
            }
        });

        res.json({
            message: "Successfully updated book"
        });
    } catch(error) {
        console.error("Error updating book: ", error);
        
        res.status(500).json({
            message: "Failed to update book"
        });
    }
};

const deleteBookValidation = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('ID must be a positive integer')
        .toInt()
        .trim()
        .escape(),
];

const deleteBook = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { id } = req.params;
        const bookId = Number(id);
        
        const bookExists = await prisma.book.findUnique({
            where: {
                id: bookId
            }
        });

        if (!bookExists) {
            return res.status(404).json({
                message: "Book does not exist"
            });
        }

        await prisma.book.delete({
            where: {
                id: bookId
            }
        });

        res.json({
            message: "Successfully deleted book"
        });
    } catch (error) {
        console.error("Delete book error:: ", error);
        
        res.status(500).json({
            message: "Failed to delete book"
        });
    }
};

export {
    getAllBooks,
    addBook,
    addBookValidation,
    updateBook,
    updateBookValidation,
    deleteBook,
    deleteBookValidation
};