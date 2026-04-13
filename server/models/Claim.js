import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    lostItem: { type: mongoose.Schema.Types.ObjectId, ref: "LostItem", required: true },
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoundItem", required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    explanation: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    autoVerified: { type: Boolean, default: false },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Claim", claimSchema);
