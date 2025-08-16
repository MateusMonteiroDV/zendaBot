
import {UserOwnerDto, UserOwnerDtoEmail} from '../aplicattion/dto/UserDto'



export interface IUserRepository {
		
		 findByEmail(email:UserOwnerDtoEmail): Promise<UserOwnerDto | null>
		 save(user:UserOwnerDto): Promise<void>;
					


}