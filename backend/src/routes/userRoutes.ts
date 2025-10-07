import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/', userController.getAllUsers);
router.post('/login', userController.login);
router.post('/seed', userController.seedAdminUser);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
