const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const provinciaSchema = new Schema({
  idProvincia: { type: Number, required: true },
  provincia: { type: String, required: true },
}, { collection: 'provincia' });
module.exports = mongoose.model("provincia", provinciaSchema);