import {IUserRepository} from '../../repository/User';
import pool from '../db'
import {UserOwnerDto, ArrayUser} from '../../aplicattion/dto/UserDto'



export class UserRepository implements IUserRepository{
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
			const client = await pool.connect();
			const query = {
				text: 'insert into user_owner(id, user_name, email, user_password) values($1, $2, $3, $4)',
				values: [user.id, user.name, user.email, user.password]

			}
			 
			 await client.query(query);
			


			client.release(); 



		}

		

}








