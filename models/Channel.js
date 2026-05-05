import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  createdAt: { type: Date, default: Date.now },
});

ChannelSchema.index({ serverId: 1 });

const Channel = mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);

export default Channel;
