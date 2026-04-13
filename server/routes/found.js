import { Router } from "express";
import FoundItem from "../models/FoundItem.js";
import { authRequired } from "../middleware/auth.js";
import { uploadFoundImage } from "../config/multer.js";

const router = Router();

router.post("/", authRequired, (req, res) => {
  uploadFoundImage.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    try {
      const { itemName, category, description, locationFound, dateFound, hiddenIdentifier } =
        req.body;
      if (!itemName || !category || !locationFound || !dateFound || !hiddenIdentifier) {
        return res.status(400).json({
          message:
            "itemName, category, locationFound, dateFound, and hiddenIdentifier are required",
        });
      }

      let imageUrl = "";
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const found = await FoundItem.create({
        itemName,
        category,
        description: description || "",
        locationFound,
        dateFound: new Date(dateFound),
        imageUrl,
        hiddenIdentifier: hiddenIdentifier.trim(),
        reportedBy: req.userId,
      });

      const safe = found.toObject();
      delete safe.hiddenIdentifier;
      return res.status(201).json(safe);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Could not save found item" });
    }
  });
});

/** Public-style browse of found items (no secret fields) */
router.get("/browse", async (req, res) => {
  try {
    const { q, status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = { $in: ["pending", "matched"] };
    if (category) filter.category = new RegExp(category, "i");
    if (q) {
      filter.$or = [
        { itemName: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { locationFound: new RegExp(q, "i") },
      ];
    }
    const items = await FoundItem.find(filter).sort({ createdAt: -1 }).lean();
    const safe = items.map((o) => {
      delete o.hiddenIdentifier;
      return o;
    });
    res.json(safe);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list found items" });
  }
});

export default router;
