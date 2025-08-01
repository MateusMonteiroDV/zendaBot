

export interface UserOwnerDtoEmail {
	email:string


}




export interface UserOwnerDto{
	id:string;
	name:string;
	email:string;
	password:string;




}


export interface UserOwnerRegisterInputDto {
		name:string;
		email:string;
		password:string;
		


}

export interface UserOwnerLoginInputDto {
		
		email:string;
		password:string;
		


}


export type UserOwnerRegiserOutputDto = string

export interface UserOwnerResponseDto{
    id:string

}





