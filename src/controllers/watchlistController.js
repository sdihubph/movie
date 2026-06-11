import { prisma } from "../config/db.js";

const addToWatchlist = async (req, res) => {
  const {movieId, status, rating, notes } = req.body;

  //verify movie exists
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    return res.status(404).json({ error: "Movie not found!"});
  }

  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: { userId_movieId: 
      {
        userId: req.user.id,
        movieId: movieId
      },
    },
  });

  if (existingInWatchlist) {
    return res.status(400).json({ error: "Movie already in the watchlist!"});
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      watchlistItem,
    },
  });
};

const removeFromWatchlist = async (req, res) => {
  const itemId = req.params.id;
  
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: {id: itemId},
  });

  if (!watchlistItem) {
    return res.status(404).json({error: "Watchlist Item not found!"});
  }

  if (watchlistItem.userId !== req.user.id) {
    return res.status(403).json({error: "Not allowed to update this watchlist item"});
  }

  await prisma.watchlistItem.delete({
    where: { id: itemId },
  });

  res.status(200).json({
    status: "success",
    message: "Movie removed from watchList"
  });
};

const updateWatchlistItem = async (req, res) => {
  const { status, rating, notes} = req.body;

  //find watchlist items and verify ownership
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return res.status(404).json({error: "Wathchlist item not found"});
  }

  if (watchlistItem.userId !== req.user.id) {
    return res.status(403).json({error: "Not allowed to update this watchlist item"});
  }

  //build update data
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  //update watchlist item
  const updatedItem = await prisma.watchlistItem.update({
    where: {id: req.params.id },
    data: updateData,
  }); 

  res.status(200).json({
    status: "success",
    data: {
      watchlistItem: updatedItem,
    },
  });

};

const getAllWatchListItems = async (req, res) => {
  const watchlistItems = await prisma.watchlistItem.findMany();
  res.status(200).json({
    status: "success",
    data: {
      watchlistItems: watchlistItems,
    },
  });
};

const getOneWatchlistItem = async (req, res) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: {id: req.params.id },
  });

  if(!watchlistItem) {
    return res.status(404).json({error: "watchlist item not found"});
  }

  if(watchlistItem.userId !== req.user.id) {
    return res.status(403).json({error: "Not Authorized to fetch this watchlist item"});
  }

  res.status(200).json({
    status: "success", 
    data: {
      watchlistItem,
    },
  });
};

export { addToWatchlist, removeFromWatchlist, updateWatchlistItem, getAllWatchListItems, getOneWatchlistItem };