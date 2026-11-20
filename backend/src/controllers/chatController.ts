import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  streamChatResponse,
  generateFollowUpSuggestions,
  generateTitleFromPrompt,
} from '../services/aiService';
import {
  saveMessage,
  getMessagesByConversationId,
  getConversationById,
  createConversation,
  touchConversation,
  updateConversationTone,
} from '../services/conversationService';
import Message from '../models/Message';
import { VALID_TONES, Tone, ChatMessage } from '../types';

const MAX_PROMPT_LENGTH = 10000;

export const sendMessageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId, content, tone = 'professional' } = req.body;

    // Validate inputs
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Message content is required' });
      return;
    }

    if (content.trim().length > MAX_PROMPT_LENGTH) {
      res.status(400).json({ success: false, error: 'Message is too long' });
      return;
    }

    if (!VALID_TONES.includes(tone as Tone)) {
      res.status(400).json({ success: false, error: 'Invalid tone value' });
      return;
    }

    const trimmedContent = content.trim();
    let convId = conversationId;

    // Create conversation if not provided
    if (!convId) {
      const title = await generateTitleFromPrompt(trimmedContent);
      const newConv = await createConversation(title, tone as Tone);
      convId = newConv._id.toString();
    } else {
      // Validate conversation exists
      if (!mongoose.Types.ObjectId.isValid(convId)) {
        res.status(400).json({ success: false, error: 'Invalid conversation ID' });
        return;
      }
      const conv = await getConversationById(convId);
      if (!conv) {
        res.status(404).json({ success: false, error: 'Conversation not found' });
        return;
      }
      // Update tone if changed
      if (conv.tone !== tone) {
        await updateConversationTone(convId, tone as Tone);
      }
    }

    // Save user message
    const userMessage = await saveMessage(convId, 'user', trimmedContent);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send conversation ID and user message first
    res.write(
      `data: ${JSON.stringify({
        type: 'init',
        conversationId: convId,
        userMessageId: userMessage._id.toString(),
      })}\n\n`
    );

    // Build message history for context
    const previousMessages = await getMessagesByConversationId(convId);
    const chatMessages: ChatMessage[] = previousMessages
      .filter((m) => m._id.toString() !== userMessage._id.toString())
      .map((m) => ({ role: m.role, content: m.content }));

    chatMessages.push({ role: 'user', content: trimmedContent });

    // Stream AI response
    let fullResponse = '';
    try {
      fullResponse = await streamChatResponse(res, chatMessages, tone as Tone);
    } catch (streamError) {
      res.write(
        `data: ${JSON.stringify({ type: 'error', error: 'AI service error' })}\n\n`
      );
      res.end();
      return;
    }

    // Save assistant message
    const assistantMessage = await saveMessage(convId, 'assistant', fullResponse);
    await touchConversation(convId);

    // Generate follow-up suggestions
    const allMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'assistant', content: fullResponse },
    ];
    const suggestions = await generateFollowUpSuggestions(allMessages);

    // Send completion event
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        assistantMessageId: assistantMessage._id.toString(),
        suggestions,
        conversationId: convId,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    next(error);
  }
};

export const regenerateResponseHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId, messageId, tone = 'professional' } = req.body;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ success: false, error: 'Invalid conversation ID' });
      return;
    }

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      res.status(400).json({ success: false, error: 'Invalid message ID' });
      return;
    }

    if (!VALID_TONES.includes(tone as Tone)) {
      res.status(400).json({ success: false, error: 'Invalid tone value' });
      return;
    }

    const conv = await getConversationById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    // Get the assistant message to regenerate
    const targetMessage = await Message.findOne({
      _id: messageId,
      conversationId,
      role: 'assistant',
    });

    if (!targetMessage) {
      res.status(404).json({ success: false, error: 'Assistant message not found' });
      return;
    }

    // Get all messages up to and including the user message before this assistant message
    const allMessages = await getMessagesByConversationId(conversationId);
    const targetIndex = allMessages.findIndex(
      (m) => m._id.toString() === messageId
    );

    if (targetIndex <= 0) {
      res.status(400).json({ success: false, error: 'No preceding user message found' });
      return;
    }

    const messagesUpToUser = allMessages.slice(0, targetIndex);
    const chatMessages: ChatMessage[] = messagesUpToUser.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(
      `data: ${JSON.stringify({ type: 'init', messageId })}\n\n`
    );

    // Stream new response
    let fullResponse = '';
    try {
      fullResponse = await streamChatResponse(res, chatMessages, tone as Tone);
    } catch {
      res.write(
        `data: ${JSON.stringify({ type: 'error', error: 'AI service error' })}\n\n`
      );
      res.end();
      return;
    }

    // Update the existing assistant message
    await Message.findByIdAndUpdate(messageId, { content: fullResponse });
    await touchConversation(conversationId);

    // Generate new suggestions
    const allWithNew: ChatMessage[] = [
      ...chatMessages,
      { role: 'assistant', content: fullResponse },
    ];
    const suggestions = await generateFollowUpSuggestions(allWithNew);

    res.write(
      `data: ${JSON.stringify({ type: 'done', messageId, suggestions })}\n\n`
    );
    res.end();
  } catch (error) {
    next(error);
  }
};
