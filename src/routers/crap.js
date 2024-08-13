import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import crud from '../controllers/crud.js';
import flow from '../controllers/flow.js';
import handleRequest from '../middlewares/handleRequest.js';
import validateId from '../middlewares/validateId.js';

const router = Router();

router.use(isAuthenticated);

router.post('/', handleRequest('form'), crud.create);
router.get('/', handleRequest(), crud.getAll);
router.get('/mine', handleRequest(), crud.getPartial);
router.get('/:id', handleRequest(), validateId, crud.get);
router.put('/:id', handleRequest('form'), validateId, crud.update);
router.patch('/:id', handleRequest('json or form'), validateId, crud.updatePartial);
router.delete('/:id', handleRequest(), validateId, crud.remove);

router.post('/:id/interested', handleRequest(), validateId, flow.interested);
router.post('/:id/suggest', handleRequest('json'), validateId, flow.suggest);
router.post('/:id/agree', handleRequest(), validateId, flow.agree);
router.post('/:id/disagree', handleRequest(), validateId, flow.disagree);
router.post('/:id/reset', handleRequest(), validateId, flow.reset);
router.post('/:id/flush', handleRequest(), validateId, flow.flush);

export default router