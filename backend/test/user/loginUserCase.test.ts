const mockCompare = jest.fn()

jest.mock('bcrypt', () => ({
	compare: mockCompare

}))

import bcrypt from 'bcrypt'


import {UserOwnerLoginInputDto, UserOwnerDto} from '../../aplicattion/dto/UserDto'
import {LoginUserCase} from '../../aplicattion/use-cases/User/LoginUserCase'




const mockUserRepository = {
	test:jest.fn(),
	findByEmail:jest.fn(),
	save:jest.fn()
}

const mockTokenJWT ={
	encode: jest.fn(),
	decode: jest.fn()

}




describe('Login user and return token',  ()=>{
	let user_owner:UserOwnerDto;
	let user:UserOwnerLoginInputDto
	let loginUserCase:LoginUserCase
		

	beforeEach(()=>{
		jest.clearAllMocks()

		
		 user_owner = {
			id: '415156156',
			name: 'teste',
			email: 'test@gmail.com',
			password: '1234'
		}

		 user = {
			email: 'test@gmail.com',
			password: '1234'
		}

		loginUserCase = new LoginUserCase(mockUserRepository as any, mockTokenJWT as any)

	})		



	test('return toke after login', async()=>{
		mockUserRepository.findByEmail.mockResolvedValue(user_owner);
		mockTokenJWT.encode.mockResolvedValue('mock-token-test')	
		
		mockCompare.mockResolvedValue(true)

		const result = await loginUserCase.execute(user);

		expect(result).toBeDefined()
		expect(typeof result).toBe('string')
 		
 		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email)

 		expect(mockTokenJWT.encode).toHaveBeenCalledTimes(1);
 		expect(result).toBe('mock-token-test')

 		expect(mockCompare).toHaveBeenCalledWith(user.password, user_owner.password);
 		

	}),


	test('return a error if email exist', async () =>{
			mockUserRepository.findByEmail.mockResolvedValue(null);

			await expect(loginUserCase.execute(user)).rejects.toThrow('Email doesnt exists')
			expect(mockCompare).not.toHaveBeenCalled()
			expect(mockTokenJWT.encode).not.toHaveBeenCalled()
	}),


	test('return a error if password is wrong', async ()=>{
			mockUserRepository.findByEmail.mockResolvedValue(user_owner)
			mockCompare.mockResolvedValue(false);

			await expect(loginUserCase.execute(user)).rejects.toThrow('Password is wrong')	
			expect(mockCompare).toHaveBeenCalledWith(user.password, user_owner.password);
			expect(mockTokenJWT.encode).not.toHaveBeenCalled()
	
	})


})