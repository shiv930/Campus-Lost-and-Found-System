import { Router } from "express";
import mongoose from "mongoose";
import LostItem from "../models/LostItem.js";
import FoundItem from "../models/FoundItem.js";
import { authRequired } from "../middleware/auth.js";
import { isLikelyMatch, combinedMatchScore } from "../utils/similarity.js";

const router = Router();

function sanitizeFound(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.hiddenIdentifier;
  return o;
}

router.get("/:lostId", authRequired, async (req, res) => {
  try {
    const { lostId } = req.params;
    if (!mongoose.isValidObjectId(lostId)) {
      return res.status(400).json({ message: "Invalid lost item id" });
    }

    const lost = await LostItem.findById(lostId);
    if (!lost) return res.status(404).json({ message: "Lost item not found" });

    if (lost.reportedBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not allowed to view matches for this report" });
    }

    const foundItems = await FoundItem.find({
      status: { $in: ["pending", "matched"] },
    });

    const matches = [];
    for (const f of foundItems) {
      const { match, score, nameSim, locSim, catMatch } = isLikelyMatch(lost, f);
      const full = combinedMatchScore(lost, f);
      matches.push({
        foundItem: sanitizeFound(f),
        isLikelyMatch: match,
        matchScore: Math.round(full.score * 100) / 100,
        breakdown: { nameSim: full.nameSim, locSim: full.locSim, categoryMatch: full.catMatch },
      });
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      lostItem: lost,
      matches,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Match lookup failed" });
  }
});

export default router;
