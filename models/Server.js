import mongoose from "mongoose";

const ServerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Server = mongoose.models.Server || mongoose.model("Server", ServerSchema);

export default Server;
