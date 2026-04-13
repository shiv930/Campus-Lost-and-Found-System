import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    locationFound: { type: String, required: true, trim: true },
    dateFound: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    hiddenIdentifier: { type: String, required: true, trim: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "matched", "returned"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FoundItem", foundItemSchema);
