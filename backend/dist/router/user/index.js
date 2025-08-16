import { Router } from 'express';
import { container } from '../../container.js';
const router = Router();
router.post('/register', container.userController.registerController.bind(container.userController));
router.post('/login', container.userController.loginController.bind(container.userController));
export default router;
