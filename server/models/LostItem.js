import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    locationLost: { type: String, required: true, trim: true },
    dateLost: { type: Date, required: true },
    contactInfo: { type: String, required: true, trim: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "matched", "returned"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LostItem", lostItemSchema);
