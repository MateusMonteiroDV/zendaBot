import {UserDtoToken} from '../aplicattion/dto/UserDto'


export interface ItokenJWT {
	 encode(payload:UserDtoToken):Promise<string | null>
	 decode(): Promise<void>



}