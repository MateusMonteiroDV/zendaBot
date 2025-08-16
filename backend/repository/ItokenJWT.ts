import {UserDtoToken} from '../aplicattion/dto/UserDto'


export interface ItokenJWT {
	 encode(payload:UserDtoToken):Promise<string>
	 decode(): Promise<void>



}