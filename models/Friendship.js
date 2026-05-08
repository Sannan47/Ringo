import mongoose from "mongoose";

const FriendshipSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  createdAt: { type: Date, default: Date.now },
});

FriendshipSchema.index({ users: 1 });

const Friendship =
  mongoose.models.Friendship ||
  mongoose.model("Friendship", FriendshipSchema);

export default Friendship;
