require('dotenv').config('../.env')

import {UserDtoToken} from '../aplicattion/dto/UserDto' 
import {ItokenJWT} from '../repository/UserRepository'
import {jsonwebtoken as jwt} from 'jsonwebtoken'



export class TokenJWT implements ItokenJWT {
	private secret:string
	private expires: string

	constructor(secret,expiresIn){
		this.secret = secret
		this.expires = expires

	}

	async encode(payload:UserDtoToken){
		try{
			const token  =  await jwt.sign(payload,secret, {expiresIn : expires} );


			return token;
	 }catch(err){
	 	console.log(err)
	 	
	 	return err;
	 }		

	}	

	 decode() {


	}


}