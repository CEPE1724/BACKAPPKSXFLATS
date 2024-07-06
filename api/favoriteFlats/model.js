const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FavoriteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    flat: {
        type: Schema.Types.ObjectId,
        ref: 'Flat',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

module.exports = mongoose.model('Favorite', FavoriteSchema);

