import {UserOwnerDtoEmail} from '../../aplicattion/dto/UserDto' 

export class User {
	constructor(
		public readonly id:string,
		public name:string,
		public email:string,
		public password: string
	)	{}

	public static validEmail(dto:UserOwnerDtoEmail): Promise<boolean>{
		const {email} = dto;			 
		 if(!email.includes('@') || !email.includes('gmail.com')){
				return Promise.resolve(false)

			
			}
		
					
			return Promise.resolve(true)					


	}





}