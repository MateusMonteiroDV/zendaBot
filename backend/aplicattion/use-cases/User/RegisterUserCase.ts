require('dotenv').config({path: '../../../.env'})

import {IRegisterUserCase} from '../../../repository';
import {UserOwnerRegisterInputDto, UserOwnerDto } from '../../dto/UserDto'
import {User} from '../../../domain/entities/User'
import {TokenJWT} from '../../../infrastructure/ItokenJWT'
import {UserOwnerRegistrOuputDto} from '../../dto/UserDto'




export class RegisterUserCase implements IRegisterUserCase{
	private userRepository: IUserRepository
	private tokeJwt:TokenJWT


	constructor(userRepository:IUserRepository, tokeJwt:TokenJWT ){
		this.userRepository = userRepoistory; 
		this.tokenJWT = tokenJWT
	}

	
	public async execute(user: UserOwnerRegisterInputDto ){
		const existEmail = await userRepository.findByEmail(user.email);
		
		if (existEmail){
			return 'email already exists'
		}

		try {
			
			const user_owner:User = await User.validEmail(user);
											
			await userRepository.save(user_owner);

			
			const token: = tokenJWT.encode(user.id);

			return token
			
			} catch(err){
				console.log(err)

			 	return err
		}
	}
}