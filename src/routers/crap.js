import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import crud from '../controllers/crud.js';
import flow from '../controllers/flow.js';
import validateId from '../middlewares/validateId.js';

const router = Router();

router.use(isAuthenticated);

router.post('/', crud.create);
router.get('/', crud.getAll);
router.get('/mine', crud.getPartial);
router.get('/:id', validateId, crud.get);
router.put('/:id', validateId, crud.update);
router.patch('/:id', validateId, crud.updatePartial);
router.delete('/:id', validateId, crud.remove);

router.post('/:id/interested', validateId, flow.interested);
router.post('/:id/suggest', validateId, flow.suggest);
router.post('/:id/agree', validateId, flow.agree);
router.post('/:id/disagree', validateId, flow.disagree);
router.post('/:id/reset', validateId, flow.reset);
router.post('/:id/flush', validateId, flow.flush);

export default router