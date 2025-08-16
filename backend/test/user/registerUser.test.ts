
// mock bcrypt before import to get the module
const mockGenSalt = jest.fn();
const mockHash = jest.fn();

jest.mock('bcrypt', () => ({
  genSalt: mockGenSalt,
  hash: mockHash
}));


require('dotenv').config({path:'../../.env'})
import {RegisterUserCase} from '../../aplicattion/use-cases/User/RegisterUserCase'
import {TokenJWT} from '../../infrastructure/tokenJWT'
import {UserRepository} from '../../infrastructure/model/UserRepository'
import { UserOwnerDto, UserOwnerRegisterInputDto,  UserOwnerRegiserOutputDto } from '../../aplicattion/dto/UserDto'



import bcrypt from 'bcrypt' 




const mockUserRepository =  {
	findByEmail: jest.fn(),
	test: jest.fn(),
	save: jest.fn(),


}  
const mockTokenJWT = {
	encode: jest.fn(),
	decode:jest.fn()
}
  






describe('RegisterUserCase', ()=>{
	
	let existsUser:UserOwnerDto;
	let user: UserOwnerRegisterInputDto;
	let registerUserCase: RegisterUserCase;

	 
	
	beforeEach(()=>{
		
		mockUserRepository.save.mockClear()
		mockTokenJWT.encode.mockClear()
	
		existsUser = {
				id: '45615161615161611651',
				name: 'teste',
				email: 'teste@gmail.com',
				password: '1561561'

		}

		user = {
			name : 'beltrano',
			email : 'beltrano@gmail.com',
			password : '1234'


		}

		registerUserCase = new RegisterUserCase(mockUserRepository as any, mockTokenJWT as any);
		
	})
		
		
		

	

	test('Register user and return token ', async ()=>{
		 	mockUserRepository.findByEmail.mockResolvedValue(null);
		 	mockUserRepository.save.mockResolvedValue(undefined)
		 	mockTokenJWT.encode.mockResolvedValue('mock-jwt-token');
		

			mockGenSalt.mockResolvedValue('testSalt')
			mockHash.mockResolvedValue('hash1234') 	
		 	
		 
		 	

		 	const result = await registerUserCase.execute(user)
		 	
		 	expect(result).toBeDefined()
		 	expect(typeof result).toBe('string')
		 	expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
		 	expect(mockUserRepository.save).toHaveBeenCalledWith(
		 		
		 		expect.objectContaining({
		 				name: user.name,
		 				email: user.email,
		 				password: 'hash1234'

		 		})

		 	)
		 	
		 	expect(mockGenSalt).toHaveBeenCalledWith(10)
		 	expect(mockHash).toHaveBeenCalledWith(user.password, 'testSalt' )
		 	expect(mockTokenJWT.encode).toHaveBeenCalledTimes(1);
		 	expect(result).toBe('mock-jwt-token')




		
	})

	test('Should throw a error if email already exists', async () =>{
		mockUserRepository.findByEmail.mockResolvedValue(existsUser);	
		
		await expect(registerUserCase.execute(user)).rejects.toThrow('Email already exist');
		expect(mockUserRepository.save).not.toHaveBeenCalled();
 		expect(mockTokenJWT.encode).not.toHaveBeenCalled();




	})



})