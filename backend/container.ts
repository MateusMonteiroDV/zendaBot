import "dotenv/config";

import Groq from "groq-sdk";

import { TokenJWT } from "./infrastructure/tokenJWT.js";
import { UserRepository } from "./infrastructure/model/UserRepository.js";
import { RegisterUserCase } from "./aplicattion/use-cases/User/RegisterUserCase.js";
import { LoginUserCase } from "./aplicattion/use-cases/User/LoginUserCase.js";
import { UserController } from "./router/user/UserController.js";

import { WhatController } from "./router/whatssap/WhatControler.js";

import { ChatApiAdapter } from "./infrastructure/ChatGptApiAdapter.js";

import { WhatsApiAdapterFactory } from "./infrastructure/SessionManager.js";
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


let groq: Groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let chatApiAdapter = new ChatApiAdapter(groq);

let whatApiFactory = new WhatsApiAdapterFactory()

let processIncomingMessage: ProcessingIncomingMessage =
  new ProcessingIncomingMessage(chatApiAdapter, whatApiFactory );

let userController: UserController = new UserController(
  registerUserCase,
  loginUserCase,
);
let whatController: WhatController = new WhatController();

export const container = {
  userController,
  whatController,
  authMiddleware,
  processIncomingMessage,
  whatApiFactory
};
