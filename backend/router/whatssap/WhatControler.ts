import { ProcessingIncomingMessage } from '../../aplicattion/use-cases/ProcessIncomingMessage'
import { Request, Response } from 'express'


export class WhatController {
  constructor(
    private processingIncomingMessage: ProcessingIncomingMessage
  ) { }
  async incomingMessageControler(req: Request, res: Response): Promise<any> {

    try {
      const payload = req.body;
      await this.processingIncomingMessage.execute(payload);

      res.status(200).json({ message: "ok" })
    } catch (e) {

      console.log(e)
      res.status(500).json({ error: "Error from the server" })
    }
  }
}
