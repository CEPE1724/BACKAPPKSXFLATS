const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const tempValidationCodeSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4, // Genera un ID único por defecto
        unique: true, // Asegura que el campo sea único
    },
    email: {
        type: String,
        required: true,
    },
    validation_code: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    expires_at: {
        type: Date,
        required: true,
    },
}, {
    collection: 'TempValidationCodesPassword' // Especifica el nombre real de la colección en la base de datos
});

// Método estático para encontrar por email
tempValidationCodeSchema.statics.findByEmail = async function(email) {
    try {
        const result = await this.find({ email: email });
        return result;
    } catch (error) {
        throw new Error(`Error finding by email: ${error.message}`);
    }
};

// Método estático para eliminar por email
tempValidationCodeSchema.statics.deleteByEmail = async function(email) {
    try {
        await this.deleteMany({ email: email });
    } catch (error) {
        throw new Error(`Error deleting by email: ${error.message}`);
    }
};

const TempValidationCodes = mongoose.model('TempValidationCodesPassword', tempValidationCodeSchema);

module.exports = TempValidationCodes;
