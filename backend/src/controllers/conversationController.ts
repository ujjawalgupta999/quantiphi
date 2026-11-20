import { Request, Response, NextFunction } from 'express';
import {
  createConversation,
  getAllConversations,
  getConversationById,
  deleteConversationById,
  getMessagesByConversationId,
} from '../services/conversationService';
import { VALID_TONES } from '../types';

export const createConversationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, tone = 'professional' } = req.body;

    if (!title || typeof title !== 'string') {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    if (!VALID_TONES.includes(tone)) {
      res.status(400).json({ success: false, error: 'Invalid tone value' });
      return;
    }

    const conversation = await createConversation(title.trim(), tone);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const getAllConversationsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversations = await getAllConversations();
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await getConversationById(id);

    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const messages = await getMessagesByConversationId(id);
    res.json({ success: true, data: { conversation, messages } });
  } catch (error) {
    next(error);
  }
};

export const deleteConversationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteConversationById(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.json({ success: true, data: { message: 'Conversation deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
