import dotenv from 'dotenv';

dotenv.config({ path: './.env' })



import { TokenJWT } from './infrastructure/tokenJWT.js'
import { UserRepository } from './infrastructure/model/UserRepository.js'
import { RegisterUserCase } from './aplicattion/use-cases/User/RegisterUserCase.js';
import { LoginUserCase } from './aplicattion/use-cases/User/LoginUserCase.js';
import { UserController } from './router/user/UserController.js';
import { ChatApiAdapter } from './infrastructure/ChatGptApiAdapter.js';
import Groq from 'groq-sdk';


let tokenJWT: TokenJWT = new TokenJWT(process.env.JWT_SECRET_KEY || '1234', process.env.JWT_EXSPIRES_TIME || '5hr');
let userRepository = new UserRepository();

let registerUserCase: RegisterUserCase = new RegisterUserCase(userRepository, tokenJWT);
let loginUserCase: LoginUserCase = new LoginUserCase(userRepository, tokenJWT)

let groq: Groq = new Groq();
let chatApiAdapter: ChatApiAdapter = new ChatApiAdapter(groq)

let userController: UserController = new UserController(registerUserCase, loginUserCase);

export const container = {
  userController


}
