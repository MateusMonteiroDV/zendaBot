import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRouter from './router/user/index.js';
const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : 'http://localhost:5000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRouter);

app.listen(5000, () => {
  console.log(' Listening on port 5000');
});

