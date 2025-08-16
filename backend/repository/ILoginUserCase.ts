import {UserOwnerLoginInputDto} from '../aplicattion/dto/UserDto'

export interface ILoginUserCase {
	 execute(user:UserOwnerLoginInputDto): Promise<string | null >


}