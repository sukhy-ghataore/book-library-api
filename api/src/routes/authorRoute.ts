import express from "express";

import { 
    getAllAuthors,
    addAuthor,
    addAuthorValidation,
    updateAuthor,
    updateAuthorValidation,
    deleteAuthor,
    deleteAuthorValidation
} from '../controllers/authorController';

const router = express.Router();

router.get('/', getAllAuthors);
router.post('/', addAuthorValidation, addAuthor);
router.put('/:id', updateAuthorValidation, updateAuthor);
router.delete('/:id', deleteAuthorValidation, deleteAuthor);

export default router;