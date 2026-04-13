import { Router } from "express";
import LostItem from "../models/LostItem.js";
import FoundItem from "../models/FoundItem.js";
import { authRequired } from "../middleware/auth.js";
import { isLikelyMatch } from "../utils/similarity.js";

const router = Router();

/** Strip internal fields — never expose hidden identifiers here */
function sanitizeFound(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.hiddenIdentifier;
  return o;
}

router.post("/", authRequired, async (req, res) => {
  try {
    const { itemName, category, description, locationLost, dateLost, contactInfo } = req.body;
    if (!itemName || !category || !locationLost || !dateLost || !contactInfo) {
      return res.status(400).json({
        message: "itemName, category, locationLost, dateLost, and contactInfo are required",
      });
    }

    const lost = await LostItem.create({
      itemName,
      category,
      description: description || "",
      locationLost,
      dateLost: new Date(dateLost),
      contactInfo,
      reportedBy: req.userId,
    });

    const foundItems = await FoundItem.find({
      status: { $in: ["pending", "matched"] },
    });

    const matches = [];
    for (const f of foundItems) {
      const { match, score, nameSim, locSim, catMatch } = isLikelyMatch(lost, f);
      if (match) {
        matches.push({
          foundItem: sanitizeFound(f),
          matchScore: Math.round(score * 100) / 100,
          breakdown: { nameSim, locSim, categoryMatch: catMatch },
        });
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    if (matches.length > 0) {
      lost.status = "matched";
      await lost.save();
    }

    return res.status(201).json({
      lostItem: lost,
      suggestedMatches: matches,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Could not save lost item" });
  }
});

/** List current user's lost reports (for navigation / search) */
router.get("/mine", authRequired, async (req, res) => {
  try {
    const { q, status, category } = req.query;
    const filter = { reportedBy: req.userId };
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");
    if (q) {
      filter.$or = [
        { itemName: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { locationLost: new RegExp(q, "i") },
      ];
    }
    const items = await LostItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list items" });
  }
});

export default router;
