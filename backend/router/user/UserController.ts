import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Request, Response } from 'express';
import { LoginUserCase } from '../../aplicattion/use-cases/User/LoginUserCase';
import { RegisterUserCase } from '../../aplicattion/use-cases/User/RegisterUserCase';

export class UserController {
  constructor(
    private registerUserCase: RegisterUserCase,
    private loginUserCase: LoginUserCase
  ) {}

  async registerController(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      const token = await this.registerUserCase.execute(user);
      res.status(200).json({ token });
    } catch (err: any) {
      if (err.message === 'Email already exists') {
         res.status(400).json({ message: err.message });
      }

      if (err.message === 'Email doesnt include @ or gmail.com') {
         res.status(401).json({ message: err.message });
      }

      console.error(err);
      res.status(500).json({ message: 'Error from the server' });
    }
  }

  async loginController(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      const token = await this.loginUserCase.execute(user);
      res.status(200).json({ token });
    } catch (err: any) {
      if (
        err.message === 'Email doesnt exists' ||
        err.message === 'Password is wrong'
      ) {
         res.status(400).json({ message: err.message });
      }

      console.error(err);
      res.status(500).json({ message: 'Error from the server' });
    }
  }
}
