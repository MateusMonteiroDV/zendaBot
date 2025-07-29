
import {ArrayUser} from '../aplicattion/dto/UserDto'



export interface IUserRepository {
		
		public findByEmail(): Promisse<boolean>
		public test(): Promisse<ArrayUser:null>;
		public save(): Promisse<void>;
					


}