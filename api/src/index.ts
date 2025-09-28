import express from 'express';
import cors from 'cors';
import config from './config';

import bookRoutes from './routes/bookRoute';
import authorRoutes from './routes/authorRoute';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);


app.listen(config.port, () => {
    console.log(`Running on port ${config.port}`);
});