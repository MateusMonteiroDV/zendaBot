require('dotenv').config({path: '../../../.env'})

import {IRegisterUserCase} from '../../../repository/IRegisterUserCase';
import {UserOwnerRegisterInputDto, UserOwnerDto } from '../../dto/UserDto'
import {User} from '../../../domain/entities/User'
import {IUserRepository} from '../../../repository/UserRepository'
import {ItokenJWT} from '../../../repository/ItokenJWT'

import {UserOwnerRegistrOuputDto} from '../../dto/UserDto'

import {v4 as generate_uuid} from 'uuid';




export class RegisterUserCase implements IRegisterUserCase{
	private userRepository: IUserRepository
	private tokenJwt:ItokenJWT


	constructor(userRepository:IUserRepository , tokenJwt:ItokenJWT ){
		this.userRepository = userRepository, 
		this.tokenJwt = tokenJwt
	}

	
	public async execute(user: UserOwnerRegisterInputDto ){
		const existEmail = await this.userRepository.findByEmail(user.email);
		
		if (existEmail){
			return 'email already exists'
		}

		try {
			
			const id_user  = await generate_uuid();
			const user_owner:User = await User.validEmail(user,id_user );
											
			await userRepository.save(user_owner);

			
			const token:string = tokenJWT.encode(id_user);

			return token
			
			} catch(err){
				console.log(err)

			 	return err
		}
	}
}