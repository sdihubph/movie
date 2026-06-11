import express from "express";
import { addToWatchlist, removeFromWatchlist, updateWatchlistItem, getAllWatchListItems, getOneWatchlistItem } from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { addToWatchlistSchema } from "../validators/watchlistValidators.js";

const router = express.Router();

router.use(authMiddleware);
router.post('/', validateRequest(addToWatchlistSchema), addToWatchlist);
router.delete('/:id', removeFromWatchlist);
router.put('/:id', updateWatchlistItem);
router.get('/', getAllWatchListItems);
router.get('/:id', getOneWatchlistItem);

export default router;