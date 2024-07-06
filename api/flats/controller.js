const Flat = require("../flats/model");
const Favorite = require("../favoriteFlats/model");

const mongoose = require("mongoose");

exports.create = async (req, res) => {
  try {
    console.log(req.body);

    const {
      areaSize,
      city,
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

    // Create the flat
    const flat = await Flat.create({
      areaSize,
      city,
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

exports.findFlatsByUser = async (req, res) => {
  const userId = req.params.userId; // Obtén el ID del usuario de los parámetros de la solicitud

  try {
    // Buscar todos los favoritos del usuario dado
    const favorites = await Favorite.find({
      user: userId,
      status: "active",
    }).populate("flat");

    // Extraer los flats de los favoritos encontrados
    const favoriteFlats = favorites.map((favorite) => favorite.flat);

    return res.status(200).json({
      status: "success",
      message: "Flats favoritos encontrados correctamente.",
      favoriteFlats: favoriteFlats,
    });
  } catch (error) {
    console.error("Error al buscar flats favoritos:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al buscar flats favoritos. Inténtalo de nuevo más tarde.",
    });
  }
};

exports.updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      areaSize,
      city,
      dateAvailable,
      hasAc,
      rentPrice,
      streetName,
      streetNumber,
      yearBuilt,
    } = req.body;
    const userId = req.body.user._id;
    // Asegúrate de acceder correctamente al _id del usuario
    console.log(id);
    const flat = await Flat.findByIdAndUpdate(
      id,
      {
        areaSize,
        city,
        dateAvailable,
        hasAc,
        rentPrice,
        streetName,
        streetNumber,
        userId, // Actualiza el userId correctamente
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
