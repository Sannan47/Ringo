import mongoose from "mongoose";

const DirectMessageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DirectThread",
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

DirectMessageSchema.index({ threadId: 1, createdAt: 1 });

const DirectMessage =
  mongoose.models.DirectMessage ||
  mongoose.model("DirectMessage", DirectMessageSchema);

export default DirectMessage;
