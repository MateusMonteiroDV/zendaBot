require('dotenv').config({path:'../../.env'})

import {RegisterUserCase} from '../../aplicattion/use-cases/User/RegisterUserCase'
import {TokenJWT} from '../../../infrastructure/ItokenJWT'
import {UserRepository} from '../../../infrastructure/model/UserRepository'
import { UserOwnerRegisterInputDto} from '../../aplicattion/dto/UserDto'

const mockUserRepository =  {
	test: jest.fn(),
	save: jest.fn(),


}  
const mockTokenJWT = {
	encode: jest.fn(),
	decode:jest.fn()
}




describe('RegisterUserCase', ()=>{
	
	let user: UserOwnerRegisterInputDto;
	let registerUserCase: RegisterUserCase;

	 
	
	beforeEach(()=>{
		
		mockUserRepository.save.mockClear()
		mockTokenJWT.encode.mockClear()

		 user = {
			name : 'beltrano',
			email : 'beltrano@gmail.com',
			password : '1234'


		}

		registerUserCase = new RegisterUserCase(mockUserRepository as any, mockTokenJWT as any);
		
	})
		
		
		

	

	test('Register user and return token ', async ()=>{
		 	mockUserRepository.save.mockResolvedValue(undefined)
		 	mockTokenJWT.encode.mockReturnValue('mock-jwt-token')

		 	const result = await registerUserCase.execute(user)
		 	
		 	expect(result).toBeDefined()
		 	expect(typeof result).toBe('string')
		 	expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
		 	expect(mockUserRepository.save).toHaveBeenCalledWith(
		 		
		 		expect.ObjectContaining({
		 				name: user.name,
		 				email: user.email,
		 				password:  user.password 

		 		})

		 	)
		 	expect(mockTokenJWT.encode).toHaveBeenCalledTimes(1);
		 	expect(result).toBe('mock-jwt-token')




		
	})

	test('Should throw a error if email already exists', async () =>{

		await expect(registerUserCase.execute(user)).rejects.toThrow('User email already exist');
		expect(mockUserRepository.save).not.toHaveBeenCalled();
 		expect(mockTokenJWT.generateToken).not.toHaveBeenCalled();




	})



})