const Flat = require("../flats/model");
const Favorite = require("../favoriteFlats/model");
const User = require("../users/model");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  try {
    const {
      areaSize,
      city,
      canton,
      dateAvailable,
      hasAc,
      rentPrice,
      streetName,
      streetNumber,
      user,
      yearBuilt,
    } = req.body;

    // Check if _id is provided and is a valid ObjectId
    const flatId = req.body._id;
    if (flatId && !mongoose.Types.ObjectId.isValid(flatId)) {
      return res.status(400).json({ message: "Invalid _id provided" });
    }

    // Check if the ID exists
    if (flatId) {
      const existingFlat = await Flat.findById(flatId);
      if (existingFlat) {
        // Update the existing flat
        await Flat.updateOne(
          { _id: flatId },
          {
            areaSize,
            city,
            canton,
            dateAvailable,
            hasAc,
            rentPrice,
            streetName,
            streetNumber,
            user,
            yearBuilt,
          }
        );
        return res.status(200).json({ message: "Flat updated successfully" });
      }
    }

    // Create a new flat if no ID provided or ID doesn't exist
    const flat = await Flat.create({
      areaSize,
      city,
      canton,
      dateAvailable,
      hasAc,
      rentPrice,
      streetName,
      streetNumber,
      user,
      yearBuilt,
    });

    return res.status(201).json(flat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.findFullFlatById = async (req, res) => {
  try {
    const { id } = req.params;
    const flat = await Flat.findById(id).populate("user");
    if (!flat) {
      return res.status(404).json({ message: "Flat not found" });
    }
    return res.status(200).json(flat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.findAllFlats = async (req, res) => {
  try {
    const flats = await Flat.find().populate("user", ["email", "avatar", "firstName", "lastName"]);
    return res.status(200).json(flats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.countFlats = async (req, res) => {
  try {
    console.log("Counting flats...");
    const flatsCount = await Flat.countDocuments({});
    return res.status(200).json({ flatsCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.findFlatsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const favorites = await Favorite.find({
      user: userId,
      status: "active",
    }).populate("flat");

    const favoriteFlats = favorites.map((favorite) => favorite.flat);

    return res.status(200).json({
      status: "success",
      message: "Favorite flats found successfully.",
      favoriteFlats: favoriteFlats,
    });
  } catch (error) {
    console.error("Error finding favorite flats:", error);
    return res.status(500).json({
      status: "error",
      message: "Error finding favorite flats. Please try again later.",
    });
  }
};

exports.updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      areaSize,
      city,
      canton,
      dateAvailable,
      hasAc,
      rentPrice,
      streetName,
      streetNumber,
      yearBuilt,
      user, // Assuming user object is provided in req.body
    } = req.body;

    const flat = await Flat.findByIdAndUpdate(
      id,
      {
        areaSize,
        city,
        canton,
        dateAvailable,
        hasAc,
        rentPrice,
        streetName,
        streetNumber,
        user,
        yearBuilt,
      },
      { new: true }
    );

    if (!flat) {
      return res.status(404).json({ message: "Flat not found" });
    }

    return res.status(200).json(flat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
