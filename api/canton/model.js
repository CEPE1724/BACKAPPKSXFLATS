const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cantonSchema = new Schema({
  idCanton: { type: Number, required: true },
  nombre: { type: String, required: true },
    idProvincia: { type: Number, required: true },
}, { collection: 'canton' });
module.exports = mongoose.model("canton", cantonSchema);