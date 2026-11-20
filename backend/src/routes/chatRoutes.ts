import { Router } from 'express';
import {
  sendMessageHandler,
  regenerateResponseHandler,
} from '../controllers/chatController';

const router = Router();

router.post('/send', sendMessageHandler);
router.post('/regenerate', regenerateResponseHandler);

export default router;
