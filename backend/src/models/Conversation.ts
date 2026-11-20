import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  title: string;
  tone: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'concise'],
      default: 'professional',
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ updatedAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
