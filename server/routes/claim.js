import { Router } from "express";
import mongoose from "mongoose";
import Claim from "../models/Claim.js";
import LostItem from "../models/LostItem.js";
import FoundItem from "../models/FoundItem.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { lostItemId, foundItemId, explanation, hiddenIdentifierGuess } = req.body;
    if (!lostItemId || !foundItemId || !explanation || hiddenIdentifierGuess == null) {
      return res.status(400).json({
        message: "lostItemId, foundItemId, explanation, and hiddenIdentifierGuess are required",
      });
    }

    if (!mongoose.isValidObjectId(lostItemId) || !mongoose.isValidObjectId(foundItemId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const lost = await LostItem.findById(lostItemId);
    const found = await FoundItem.findById(foundItemId);
    if (!lost || !found) {
      return res.status(404).json({ message: "Lost or found item not found" });
    }

    if (lost.reportedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only claim for your own lost reports" });
    }

    if (found.status === "returned") {
      return res.status(400).json({ message: "This item has already been returned" });
    }

    const exact =
      String(hiddenIdentifierGuess).trim() === String(found.hiddenIdentifier).trim();

    const claim = await Claim.create({
      lostItem: lost._id,
      foundItem: found._id,
      claimant: req.userId,
      explanation,
      status: exact ? "approved" : "rejected",
      autoVerified: exact,
    });

    if (exact) {
      found.status = "matched";
      await found.save();
      lost.status = "matched";
      await lost.save();
    }

    return res.status(201).json({
      message: exact
        ? "Claim approved — hidden identifier verified."
        : "Claim rejected — hidden identifier does not match.",
      claim: {
        id: claim._id,
        status: claim.status,
        autoVerified: claim.autoVerified,
        createdAt: claim.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Could not process claim" });
  }
});

router.get("/mine", authRequired, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.userId })
      .populate("lostItem")
      .populate("foundItem")
      .sort({ createdAt: -1 })
      .lean();

    const safe = claims.map((c) => {
      if (c.foundItem) delete c.foundItem.hiddenIdentifier;
      return c;
    });
    res.json(safe);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list claims" });
  }
});

export default router;
