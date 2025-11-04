
import { Router } from 'express'
import { container } from '../../container.js'


const router = Router()
router.post('/addNumber', container.whatController.incomingMessageControler.bind(container.whatController))

export default router

