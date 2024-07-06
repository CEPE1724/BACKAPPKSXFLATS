const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FlatSchema = new Schema({
    areaSize: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    dateAvailable: {
        type: String,
        required: true
    },
    hasAc: {
        type: Boolean,
        required: true
    },
    rentPrice: {
        type: String,
        required: true
    },
    streetName: {
        type: String,
        required: true
    },
    streetNumber: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User
        required: true,
    },
    yearBuilt: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Flat', FlatSchema);
    
