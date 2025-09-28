import express from "express";

import {
    getAllBooks,
    addBook,
    addBookValidation,
    updateBook,
    updateBookValidation,
    deleteBook,
    deleteBookValidation
} from '../controllers/bookController';

const router = express.Router();

router.get('/', getAllBooks);
router.post('/', addBookValidation, addBook);
router.put('/:id', updateBookValidation, updateBook);
router.delete('/:id', deleteBookValidation, deleteBook);

export default router;