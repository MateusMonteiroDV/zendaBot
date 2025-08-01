require('dotenv').config({path: '../../../.env'})

import {IRegisterUserCase} from '../../../repository/IRegisterUserCase';
import {UserOwnerRegisterInputDto, UserOwnerDto } from '../../dto/UserDto'
import {User} from '../../../domain/entities/User'
import {IUserRepository} from '../../../repository/IUserRepository'
import {ItokenJWT} from '../../../repository/ItokenJWT'



import {v4 as generate_uuid} from 'uuid';
import bcrypt from 'bcrypt'



export class RegisterUserCase implements IRegisterUserCase{
	
	constructor(	
		private userRepository: IUserRepository,
		private tokenJWT:ItokenJWT


		){}

	
	 async execute(user: UserOwnerRegisterInputDto ){
		


		try {
			
			if(await this.userRepository.findByEmail(user.email)){;
				throw new Error('Email already exists')		
			}
			const saltRound:number= 10;
			const salt:string= await bcrypt.genSalt(saltRound);
			const hash_password:string = await bcrypt.hash(user.password, salt);

		
			const id_user:string  = await generate_uuid();
			const isValid:boolean = await User.validEmail(user.email);
			
			if(!isValid){
				throw new Error('Email doenst include @ or gmail.com')
			}

			
			const user_owner:User = new User(id_user, user.name, user.email, hash_password);
						
			await this.userRepository.save(user_owner);
			
			
			const token:string = await this.tokenJWT.encode(id_user);

			return token
			
			} catch(err){
				console.log(err)

 				throw err;
		}
	}
}