import {IUserRepository} from '../../../repository'
import {ItokenJWT} from '../../../repository/ItokenJWT'
import bcrypt from 'bcrypt'
import { UserOwnerLoginInputDto} from '../../../aplicattion/dto/UserDto';



export class LoginUserCase implements ILoginUserCase{

	constructor(	
		private userRepository:IUserRepository,
		private tokenJWT:ItokenJWT
) {}			

	async execute(user:UserOwnerLoginInputDto ){
	  	try{	
			const user_owner:string =  await this.userRepository.findByEmail(user.email);

			if(!user_owner){

				throw new Error('Email doenst exists');
			}	

			const passwordIsValid:boolean = bcrypt.compare(user.password, user_owner.password);

			if(!passwordIsValid){
				throw new Error('Password is wrong');
			}	

			const token:string = this.tokenJWT.encode(user_owner.id);

			return token;


			return token
		}catch(err){
			console.log(err);
			return err
		}	
	}


}