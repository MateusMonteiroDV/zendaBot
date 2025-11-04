
import { ProcessingIncomingMessage } from '../../aplicattion/use-cases/ProcessIncomingMessage'
import { Request, Response } from 'express'
import {addNumber} from 'socketManager.js'

export class WhatController {
  constructor(
    private processingIncomingMessage: ProcessingIncomingMessage
  ) { }
  async incomingMessageControler(req: Request, res: Response): Promise<any> {
    const {number} = req.body
    try {
      await addNumber(number) 
      res.status(200).json({ message: "ok" })
    } catch (e) {

      console.log(e)
      res.status(500).json({ error: "Error from the server" })
    }
  }
}

