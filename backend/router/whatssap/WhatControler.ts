
import { Request, Response } from 'express'
import {container} from "../../container.js"

export class WhatController {
  constructor() { }
  async incomingMessageControler(req: Request, res: Response): Promise<any> {
    const {number} = req.body
    try {

     await container.whatApiFactory.getSession(number)      
      res.status(200).json({ message: "ok" })
    } catch (e) {

      console.log(e)
      res.status(500).json({ error: "Error from the server" })
    }
  }
}

