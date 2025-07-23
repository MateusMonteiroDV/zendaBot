require('dotenv').config({path: '../../../.env'})

import {IRegisterUserCase} from '../../../repository';
import {UserOwnerRegisterInputDto, UserOwnerDto } from '../../dto/UserDto'
import {User} from '../../../domain/entities/User'
import {TokenJWT} from '../../../infrastructure/ItokenJWT'




export class RegisterUserCase implements IRegisterUserCase{
	private userRepository: IUserRepository

	constructor(userRepository:IUserRepository){
		this.userRepository = userRepoistory; 
	}

	public async execute(user: UserOwnerRegisterInputDto ){
		const existEmail = await userRepository.findByEmail(user.email);
		
		if (existEmail){
			return 'email already exists'
		}

		const user_owner = await User.validEmail(user);

		try{
			
			const user_owner = await User.validEmail(user);
											
			await userRepository.save(user_owner);

			const tokenJWT: TokenJWT = new TokenJWT(process.env.JWT_SECRET_KEY, process.env.JWT_EXSPIRES_TIME);
			const token:string = tokenJWT.encode(user.id);

			return token




		


		}catch(err){
			 console.log(err)

			 return err
		}








}


}