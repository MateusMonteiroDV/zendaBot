import { UserOwnerRegisterInputDto, UserOwnerDto } from '../aplicattion/dto/UserDto'
export interface IUserRegisteUserUseCase {
  execute(user: UserOwnerRegisterInputDto): Promise<string | Error | null>;

}
