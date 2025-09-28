import { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';

const handleValidationErrors = (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Validation errors",
            errors: errors.array()
        });

        return true;
    }

    return false;
};

export default handleValidationErrors;