

require('dotenv').config()

import {Request,Response} from 'express';

const express  = require('express');

const  cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const app = express();
const cookieParser = require('cookie-parser')

const corsOptions ={
	origin: process.env.NODE_ENV === 'production'? process.env.CLIENT_URL: 'http://localhost:5000',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],	
	allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))




app.get('/', async (req:Request, res:Response) => {
    
      return res.end('Hello world');
});


app.listen(5000, ()=>{

		console.log('Listening on port 5000 ');

})