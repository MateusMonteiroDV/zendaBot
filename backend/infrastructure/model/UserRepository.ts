import { QueryResult } from 'pg'
import { IUserRepository } from '../../repository/IUserRepository.js';
import pool from '../db.js'
import { UserOwnerDto, UserOwnerDtoEmail } from '../../aplicattion/dto/UserDto.js'




export class UserRepository implements IUserRepository {


  public async findByEmail(email: string) {


    const client = await pool.connect();

    const query = {
      text: 'select * from user_owner where email = $1',
      values: [email],

    }


    const result: QueryResult<any> = await client.query(query);
    return result.rows[0]
  }




  public async save(user: UserOwnerDto) {
    const client = await pool.connect();
    const query = {
      text: 'insert into user_owner(id, user_name, email, user_password) values($1, $2, $3, $4)',
      values: [user.id, user.name, user.email, user.password]

    }

    await client.query(query);



    client.release();



  }



}








