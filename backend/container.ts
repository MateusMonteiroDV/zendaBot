import 'dotenv/config'

import Groq from 'groq-sdk'

import { TokenJWT } from './infrastructure/tokenJWT.js'
import { UserRepository } from './infrastructure/model/UserRepository.js'
import { RegisterUserCase } from './aplicattion/use-cases/User/RegisterUserCase.js';
import { LoginUserCase } from './aplicattion/use-cases/User/LoginUserCase.js';
import { UserController } from './router/user/UserController.js';

import { WhatController } from './router/whatssap/WhatControler.js'

import { ChatApiAdapter } from './infrastructure/ChatGptApiAdapter.js';

import { WhatsApiAdapter } from './infrastructure/WhatsAppApiAdapter.js';
import { ProcessingIncomingMessage } from './aplicattion/use-cases/ProcessIncomingMessage.js';


let tokenJWT: TokenJWT = new TokenJWT();

let userRepository = new UserRepository();

let registerUserCase: RegisterUserCase = new RegisterUserCase(userRepository, tokenJWT);
let loginUserCase: LoginUserCase = new LoginUserCase(userRepository, tokenJWT)

let groq: Groq = new Groq()

let chatApiAdapter = new ChatApiAdapter(groq)

let whatApiAdapter: WhatsApiAdapter = new WhatsApiAdapter()

let processIncomingMessage: ProcessingIncomingMessage = new ProcessingIncomingMessage(chatApiAdapter, whatApiAdapter)

let userController: UserController = new UserController(registerUserCase, loginUserCase);
let whatController: WhatController = new WhatController(processIncomingMessage)

export const container = {
  userController,
  whatController


}
