
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: env.clientUrl
}));

// Body parser
app.use(express.json({ limit: '1mb' }));

// Logger
if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
}

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to MoveMate API',
        status: 'Server is running'
    });
});

// API routes
app.use('/api/v1', routes);

// 404 middleware
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
