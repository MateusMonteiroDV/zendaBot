import dotenv from 'dotenv'
dotenv.config({ path: '../.env', debug: true })


const jw = {
  secret: process.env.JWT_SECRET_KEY
}

import { UserDtoToken } from '../aplicattion/dto/UserDto'
import { ItokenJWT } from '../repository/ItokenJWT'
import jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken'



export class TokenJWT implements ItokenJWT {
  private secret: string
  private expires: string


  constructor() {
    this.secret = jw.secret!
    this.expires = process.env.JWT_EXSPIRES_TIME!

  }

  async encode(payload: UserDtoToken) {
    const token: string = jwt.sign(payload, this.secret as Secret, { expiresIn: this.expires } as SignOptions);


    return token;


  }

  async decode() {


  }


}
