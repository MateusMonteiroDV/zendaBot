import {IRegisterUserCase} from '../../../repository';
import {UserOwnerRegisterInputDto, UserOwnerDto } from '../../dto/UserDto'
import {User} from '../../../domain/entities/User'



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
				



		


		}catch(err){
			 console.log(err)

			 return err
		}








}


}