import {QueryResult} from 'pg'
import {IUserRepository} from '../../repository/IUserRepository';
import pool from '../db'
import {UserOwnerDto,UserOwnerDtoEmail} from '../../aplicattion/dto/UserDto'

import {v4 as generate_uuid} from 'uuid'



export class UserRepository implements IUserRepository{
		

		public async findByEmail(email:UserOwnerDtoEmail) {
						
			try{	
				const client = await pool.connect();
					
					const query = {
						text: 'select email from user_owner where email = $1',
						values: [email]

			}


				const result:QueryResult<any> = await client.query(query);
				
				client.release()	


			  	return result.rows[0]
			} catch(err){

					console.log(err);
					
					throw new Error('Error to find email' + err)



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








