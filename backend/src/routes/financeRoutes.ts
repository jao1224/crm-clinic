import { Router } from 'express';
import * as financeController from '../controllers/financeController';

const router = Router();

router.get('/', financeController.getAllFinances);
router.get('/:id', financeController.getFinanceById);
router.post('/', financeController.createFinance);
router.put('/:id', financeController.updateFinance);
router.delete('/:id', financeController.deleteFinance);

export default router;
