import Conversation, { IConversation } from '../models/Conversation';
import Message, { IMessage } from '../models/Message';
import mongoose from 'mongoose';

export const createConversation = async (
  title: string,
  tone: string
): Promise<IConversation> => {
  const conversation = new Conversation({ title, tone });
  return await conversation.save();
};

export const getAllConversations = async (): Promise<IConversation[]> => {
  const docs = await Conversation.find().sort({ updatedAt: -1 }).lean();
  return docs as unknown as IConversation[];
};

export const getConversationById = async (
  id: string
): Promise<IConversation | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Conversation.findById(id).lean();
  return doc as unknown as IConversation | null;
};

export const updateConversationTone = async (
  id: string,
  tone: string
): Promise<IConversation | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Conversation.findByIdAndUpdate(
    id,
    { tone, updatedAt: new Date() },
    { new: true }
  ).lean();
  return doc as unknown as IConversation | null;
};

export const touchConversation = async (id: string): Promise<void> => {
  await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });
};

export const deleteConversationById = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await Conversation.findByIdAndDelete(id);
  if (result) {
    await Message.deleteMany({ conversationId: id });
    return true;
  }
  return false;
};

export const saveMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<IMessage> => {
  const message = new Message({ conversationId, role, content });
  return await message.save();
};

export const getMessagesByConversationId = async (
  conversationId: string
): Promise<IMessage[]> => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) return [];
  const docs = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  return docs as unknown as IMessage[];
};

export const generateTitle = (prompt: string): string => {
  const cleaned = prompt.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 60) return cleaned;
  return cleaned.substring(0, 57) + '...';
};
