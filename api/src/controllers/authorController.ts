import prisma from '../prisma-client';
import express, {type Request, type Response} from 'express';
import { param, body } from 'express-validator';
import handleValidationErrors from '../utils/routeValidator';

const getAllAuthors = async (req: Request, res: Response) => {
    const authors = await prisma.author.findMany();

    res.json(authors);
};

const addAuthorValidation = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 250 })
        .withMessage('Name must be between 10 and 250 characters')
        .trim()
        .escape()
];

const addAuthor = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { name } = req.body;

        const newAuthor = await prisma.author.create({
            data: {
                name: name
            },
        });

        res.status(201).json({
            message: "Successfully created author",
            author: newAuthor
        });
    } catch(error) {
        console.error("Error adding author: ", error);
        
        res.status(500).json({
            message: "Failed to add author"
        });
    }
};

const updateAuthorValidation = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('ID must be a positive integer')
        .toInt()
        .trim()
        .escape(),
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 250 })
        .withMessage('Name must be between 10 and 250 characters')
        .trim()
        .escape()
];

const updateAuthor = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { id }  = req.params;
        const { name } = req.body;
        const authorId = Number(id);

        if (isNaN(authorId)) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }

        const authorExists = await prisma.author.findUnique({
            where: {
                id: authorId
            }
        });

        if (!authorExists) {
            return res.status(404).json({
                message: "Book does not exist"
            });
        }

        await prisma.author.update({
            data: {
                name
            },
            where: {
                id: authorId
            }
        });

        res.json({
            message: "Successfully updated author"
        });
    } catch(error) {
        console.error("Error updating author: ", error);
        
        res.status(500).json({
            message: "Failed to update author"
        });
    }
};

const deleteAuthorValidation = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('ID must be a positive integer')
        .toInt()
        .trim()
        .escape(),
];

const deleteAuthor = async (req: Request, res: Response) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { id } = req.params;
        const authorId = Number(id);

        if (isNaN(authorId)) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }
        
        const authorExists = await prisma.author.findUnique({
            where: {
                id: authorId
            }
        });

        if (!authorExists) {
            return res.status(404).json({
                message: "Author does not exist"
            });
        }

        await prisma.author.delete({
            where: {
                id: authorId
            }
        });

        res.json({
            message: "Successfully deleted author"
        });
    } catch (error) {
        console.error("Delete author error: ", error);
        
        res.status(500).json({
            message: "Failed to delete author"
        });
    }
};

export {
    getAllAuthors,
    addAuthor,
    addAuthorValidation,
    updateAuthor,
    updateAuthorValidation,
    deleteAuthor,
    deleteAuthorValidation
};