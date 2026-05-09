import mongoose from "mongoose";

const DirectThreadSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  createdAt: { type: Date, default: Date.now },
});

DirectThreadSchema.index({ participants: 1 });

const DirectThread =
  mongoose.models.DirectThread ||
  mongoose.model("DirectThread", DirectThreadSchema);

export default DirectThread;
