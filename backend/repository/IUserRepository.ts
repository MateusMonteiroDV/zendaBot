
import {ArrayUser} from '../aplicattion/dto/UserDto'
import {UserOwnerDto} from '../aplicattion/dto/UserDto'



export interface IUserRepository {
		
		 findByEmail(): Promise<UserOwnerDto | null>
		 test(): Promise<ArrayUser | null>;
		 save(user:UserOwnerDto): Promise<void>;
					


}