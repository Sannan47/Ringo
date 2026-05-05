import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
