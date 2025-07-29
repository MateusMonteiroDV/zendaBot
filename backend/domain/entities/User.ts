import {UserOwnerDto} from '../../aplicattion/dto/UserDto' 

export class User {
	constructor(
		public readonly id:string,
		public name:string,
		public email:string,
		public password: string
	)	{}

	public static validEmail(email:UserOwnerDtoEmail): Promisse<boolean>{
		 
		 if(!email.includes('@') || !email.includes('gmail.com')){
					return false

			
			}
		
					
			return true					


	}





}