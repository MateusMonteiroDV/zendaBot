import {IUserRepository} from '../../repository';
import pool from '../db'
import {UserOwnerDto, ArrayUser} from '../../aplicattion/dto/UserDto'

class UserRepository implements IUserRepository{
		public async  test(){
			try{

				const test =  await pool.connect();



				const users = await test.query('select * from public.user_owner')


				return users;
			
			}	catch(err){
				console.log(err);
				throw err
			}


		}


		public async save( user:UserOwnerDto){
				



		}

		

}




const user: UserRepository = new UserRepository();
const teste = user.test()


console.log(teste);


