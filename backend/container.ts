import "dotenv/config";

import Groq from "groq-sdk";

import { TokenJWT } from "./infrastructure/tokenJWT.js";
import { UserRepository } from "./infrastructure/model/UserRepository.js";
import { RegisterUserCase } from "./aplicattion/use-cases/User/RegisterUserCase.js";
import { LoginUserCase } from "./aplicattion/use-cases/User/LoginUserCase.js";
import { UserController } from "./router/user/UserController.js";

//import { WhatController } from "./router/whatssap/WhatControler.js";

import { ChatApiAdapter } from "./infrastructure/ChatGptApiAdapter.js";

import { BaileysApiAdapter } from "./infrastructure/WhatsAppApiAdapter.js";
import { ProcessingIncomingMessage } from "./aplicattion/use-cases/ProcessIncomingMessage.js";
import { AuthMiddleware } from "./middleware/auth.js";

let tokenJWT: TokenJWT = new TokenJWT();
let authMiddleware: AuthMiddleware = new AuthMiddleware(tokenJWT);

let userRepository = new UserRepository();

let registerUserCase: RegisterUserCase = new RegisterUserCase(
  userRepository,
  tokenJWT,
);
let loginUserCase: LoginUserCase = new LoginUserCase(userRepository, tokenJWT);

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);
let groq: Groq = new Groq();

let chatApiAdapter = new ChatApiAdapter(groq);

let baileysApiAdapter: BaileysApiAdapter = new BaileysApiAdapter();

let processIncomingMessage: ProcessingIncomingMessage =
  new ProcessingIncomingMessage(chatApiAdapter, baileysApiAdapter);

let userController: UserController = new UserController(
  registerUserCase,
  loginUserCase,
);
//let whatController: WhatController = new WhatController(processIncomingMessage);

export const container = {
  userController,
  authMiddleware,
  processIncomingMessage,
};
