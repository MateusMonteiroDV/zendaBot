import {UserOwnerResponseDto, UserOwnerDto} from '../aplicattion/dto/UserDto'
export interface IUserMapper {
	 toDomain():any;
	 toResponse():any;

}