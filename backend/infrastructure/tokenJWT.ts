import dotenv from 'dotenv'
dotenv.config({path:'../.env'})



import {UserDtoToken} from '../aplicattion/dto/UserDto' 
import {ItokenJWT} from '../repository/ItokenJWT'
import * as jwt from 'jsonwebtoken'; 
import {Secret,SignOptions} from 'jsonwebtoken'



export class TokenJWT implements ItokenJWT {
	

	constructor(
		private secret:string,
		private expires: string
	){}

	  async encode(payload:UserDtoToken){
		try{
			const token:string  =  jwt.sign(payload,this.secret as Secret, {expiresIn: this.expires } as SignOptions);


			return token;
	 }catch(err){
	 	
	 	console.log(err)
	 	
	 	return null;
	 }		

	}	

	  async decode() {


	}


}