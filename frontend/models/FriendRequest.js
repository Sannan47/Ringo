import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

FriendRequestSchema.index({ fromUser: 1, toUser: 1, status: 1 });

const FriendRequest =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", FriendRequestSchema);

export default FriendRequest;
