const mockCompare =jest.fn()

jest.mock('bcrypt', ()=>{
	compare: mockCompare/

})_

import bcrypt from 'brypt'

import {UserOwnerLoginInputDto} from '../../aplicattion/dto/UserDto'
import {LoginUserCase} from '../../aplicattion/use-cases/User/LoginUserCase'




const mockerUserRepository = {
	test:jest.fn();
	findByEmail:jest.fn()
	save:jest.fn()
}

const mockTokenJWT ={
	encode: jest.fn();
	decode: jest.fn()

}




describe('Login user and return token', async ()=>{
	beforeEach(()=>{
		mockUserRepository.save.mockClear()
		mockTokenJWT.encode.mockClear()

		const emailExists:UserOwnerDto;
		const user:UserOwnerLoginInputDto
		const loginUserCase:LoginUserCase
		const emailExists = {
			id: '415156156',
			name: 'teste',
			email: 'test@gmail.com',
			password: '15616'
		}

		const user = {
			email: 'test@gmail.com',
			password: '1234'
		}

		loginUserCase = new LoginUserCase( mockUserRepositroy as any, mockTokenJWT as any_)

	})		



	test('return toke after login', async()=>{
		mockerUserRepository.findByEmail.mockResolvedValue(emailExists);
		mockTokenJWT.encode.mockResolvedValue('mock-token-test')	
		
		const result = await loginUserCase.execute(user);

		expect(result).toBeDefined()
		expect(typeof result).toBe('string')
 		
 		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
		 		
		 		expect.objectContaining({
		 				
		 				email: user.email,
		 			
		 		})

		 	)

 		expect(mockTokenJWT.encode).toHaveBeenCalledTimes(1);
 		expect(result).toBe('mock-token-test')

	}),


	test('return a error if email exist', async () =>{


	}),


	testI('return a error if password is wrong', async ()=>{


	})


})