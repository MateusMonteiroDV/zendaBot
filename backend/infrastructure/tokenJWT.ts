require('dotenv').config('../.env')

import {UserDtoToken} from '../aplicattion/dto/UserDto' 
import {ItokenJWT} from '../repository/ItokenJWT'
import {jsonwebtoken as jwt} from 'jsonwebtoken'



export class TokenJWT implements ItokenJWT {
	

	constructor(
		private secret:string,
		private expires: string
	){}

	 public async encode(payload:UserDtoToken){
		try{
			const token  =  await jwt.sign(payload,this.secret, {expiresIn : this.expires} );


			return token;
	 }catch(err){
	 	
	 	console.log(err)
	 	
	 	return err;
	 }		

	}	

	  async decode() {


	}


}