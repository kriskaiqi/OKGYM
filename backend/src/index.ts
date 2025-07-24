import "reflect-metadata";
import * as path from 'path';
import express from 'express';

const app = express();

// Serving static files
app.use('/static', express.static(path.join(__dirname, '../public')));