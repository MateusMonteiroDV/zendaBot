require('dotenv').config({path:'../../.env'})


import {Pool} from 'pg';


const pool = new Pool({
	user: process.env.USER_DATABASE_DEV,
	host: process.env.HOST_DATABSE_DEV,
	database: process.env.DB_DATABSE_DEV, 
	password: process.env.PS_DATABASE_DEV,
	port: Number(process.env.PORT_DATABSE_DEV)


})







export default pool