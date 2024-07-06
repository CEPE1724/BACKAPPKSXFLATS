const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    _idUsuarioEnvia: { type: mongoose.Schema.Types.ObjectId, required: true },
    _idUsuarioRecibe: { type: mongoose.Schema.Types.ObjectId, required: true },
    idFlat: { type: mongoose.Schema.Types.ObjectId, required: true },
    city: { type: String, required: true },
    streetName: { type: String, required: true },
    streetNumber: { type: String, required: true }
  });

  module.exports = mongoose.model('message', messageSchema);
    