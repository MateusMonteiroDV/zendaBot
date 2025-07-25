import {UserOwnerDto} from '../../aplicattion/dto/UserDto' 

class User {
	constructor(
		public readonly id:string,
		public name:string,
		public email:string,
		public password: string
	)	{}

	public static ValidEmail(user_owner:UserOwnerDto, id: string): User{
		 
		 if(!user_owner.email.include('@') || !user_owner.email.include('gmail.com')){
					throw new error('You must include @ and gmail')	


			}
		
			return new User(
					id,
					user_owner.name, 
					user_owner.email,
					user_owner.password,
					
)

	}





}