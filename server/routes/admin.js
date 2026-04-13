import { Router } from "express";
import mongoose from "mongoose";
import LostItem from "../models/LostItem.js";
import FoundItem from "../models/FoundItem.js";
import Claim from "../models/Claim.js";
import User from "../models/User.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, adminOnly);

/** GET /api/admin/all — aggregate dashboard data */
router.get("/all", async (req, res) => {
  try {
    const { lostQ, foundQ, claimStatus, itemStatus } = req.query;

    const lostFilter = {};
    if (itemStatus) lostFilter.status = itemStatus;
    if (lostQ) {
      lostFilter.$or = [
        { itemName: new RegExp(lostQ, "i") },
        { contactInfo: new RegExp(lostQ, "i") },
        { locationLost: new RegExp(lostQ, "i") },
      ];
    }

    const foundFilter = {};
    if (itemStatus) foundFilter.status = itemStatus;
    if (foundQ) {
      foundFilter.$or = [
        { itemName: new RegExp(foundQ, "i") },
        { locationFound: new RegExp(foundQ, "i") },
      ];
    }

    const claimFilter = {};
    if (claimStatus) claimFilter.status = claimStatus;

    const [lostItems, foundItems, claims, users] = await Promise.all([
      LostItem.find(lostFilter).populate("reportedBy", "name email").sort({ createdAt: -1 }).lean(),
      FoundItem.find(foundFilter).populate("reportedBy", "name email").sort({ createdAt: -1 }).lean(),
      Claim.find(claimFilter)
        .populate("lostItem")
        .populate("foundItem")
        .populate("claimant", "name email")
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(),
    ]);

    // Never expose hiddenIdentifier even to admin API responses (privacy)
    const foundSafe = foundItems.map((f) => {
      const o = { ...f };
      delete o.hiddenIdentifier;
      return o;
    });

    const claimsSafe = claims.map((c) => {
      const o = { ...c };
      if (o.foundItem) delete o.foundItem.hiddenIdentifier;
      return o;
    });

    res.json({
      stats: {
        users,
        lostCount: lostItems.length,
        foundCount: foundSafe.length,
        claimsCount: claimsSafe.length,
      },
      lostItems,
      foundItems: foundSafe,
      claims: claimsSafe,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Admin fetch failed" });
  }
});

/** Manual override: PATCH /api/admin/claims/:id  body: { status, adminNote? } */
router.patch("/claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const claim = await Claim.findById(id).populate("foundItem").populate("lostItem");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    claim.status = status;
    if (adminNote != null) claim.adminNote = adminNote;
    claim.autoVerified = false;
    await claim.save();

    if (status === "approved") {
      if (claim.foundItem) {
        await FoundItem.findByIdAndUpdate(claim.foundItem._id, { status: "matched" });
      }
      if (claim.lostItem) {
        await LostItem.findByIdAndUpdate(claim.lostItem._id, { status: "matched" });
      }
    }

    res.json({ message: "Claim updated", claimId: claim._id, status: claim.status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update failed" });
  }
});

/** Mark found or lost item returned: PATCH /api/admin/items/:type(found|lost)/:id */
router.patch("/items/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    if (type === "found") {
      await FoundItem.findByIdAndUpdate(id, { status: "returned" });
      return res.json({ message: "Found item marked as returned" });
    }
    if (type === "lost") {
      await LostItem.findByIdAndUpdate(id, { status: "returned" });
      return res.json({ message: "Lost item marked as returned" });
    }
    return res.status(400).json({ message: "type must be found or lost" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;
