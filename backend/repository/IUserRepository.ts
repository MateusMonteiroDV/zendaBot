
import { UserOwnerDto, UserOwnerDb, UserOwnerDtoEmail } from '../aplicattion/dto/UserDto'



export interface IUserRepository {

  findByEmail(email: string): Promise<UserOwnerDb | null>
  save(user: UserOwnerDto): Promise<void>;



}
