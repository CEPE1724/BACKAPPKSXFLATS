const Flats = require("../flats/model");

exports.getAll = async (req, res) => {
  const { sortBy } = req.query;
  let sortQuery = {};

  if (sortBy === "rentPriceDesc") {
    sortQuery = { rentPrice: -1 };
  } else if (sortBy === "streetNameDesc") {
    sortQuery = { streetName: -1 };
  }

  try {
    const flats = await Flats.find().sort(sortQuery);
    res.status(200).json(flats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
