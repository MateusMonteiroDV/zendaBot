import {UserOwnerRegisterOutputDto} from '../aplicattion/UserDto'

export interface IUserRegisteUserUseCase{
	public execute: Promissse<UserOwnerRegisterOutputDto>;

}