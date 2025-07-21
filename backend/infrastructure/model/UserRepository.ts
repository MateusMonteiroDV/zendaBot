import {IUserRepository} from '../../repository';
import pool from '../db'
import {UserOwnerDto, ArrayUser} from '../../aplicattion/dto/UserDto'

class UserRepository implements IUserRepository{
		public async test(){
			try{

				const test =  await pool.connect();
				const users = await test.query('select * from user_owner')

				test.release()

				return users.rows
			
			}	catch(err){
				console.log(err);
				throw err
			}


		}


		public async save( user:UserOwnerDto){
				



		}

		

}




const userRepository = new UserRepository();

userRepository.test()
.then(users =>{
	console.log( JSON.stringify(users))


}).catch(err=>{
		console.log(err)

})



