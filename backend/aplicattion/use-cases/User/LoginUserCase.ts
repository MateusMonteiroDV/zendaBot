import {IUserRepository} from '../../../repository/IUserRepository'
import {ILoginUserCase} from '../../../repository/ILoginUserCase'
import {ItokenJWT} from '../../../repository/ItokenJWT'
import * as bcrypt from 'bcrypt'
import { UserOwnerLoginInputDto, UserOwnerDto} from '../../../aplicattion/dto/UserDto';



export class LoginUserCase implements ILoginUserCase{

	constructor(	
		private userRepository:IUserRepository,
		private tokenJWT:ItokenJWT
) {}			

	async execute(user:UserOwnerLoginInputDto ){
	  	try{	
			const user_owner:UserOwnerDto | null =  await this.userRepository.findByEmail({email:user.email});

			if(!user_owner){

				throw new Error('Email doesnt exists');
			}	

			const passwordIsValid:boolean = await bcrypt.compare(user.password, user_owner.password);

			if(!passwordIsValid){
				throw new Error('Password is wrong');
			}	

			const token = await this.tokenJWT.encode({id:user_owner.id});

			return token;


			
		} catch(err){
			console.log(err);
			 throw err
		}	
	}


}