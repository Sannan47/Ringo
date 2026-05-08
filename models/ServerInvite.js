import mongoose from "mongoose";

const ServerInviteSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  token: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
  maxUses: { type: Number, default: 1 },
  uses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

ServerInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ServerInvite =
  mongoose.models.ServerInvite ||
  mongoose.model("ServerInvite", ServerInviteSchema);

export default ServerInvite;
