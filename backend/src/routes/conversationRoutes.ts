import { Router } from 'express';
import {
  createConversationHandler,
  getAllConversationsHandler,
  getConversationHandler,
  deleteConversationHandler,
} from '../controllers/conversationController';

const router = Router();

router.post('/', createConversationHandler);
router.get('/', getAllConversationsHandler);
router.get('/:id', getConversationHandler);
router.delete('/:id', deleteConversationHandler);

export default router;
