const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dv7hswv6b/image/upload/v1623680974/avatars/avatar1.jpg'
    },
    codigo: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid Email']
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        select: false // Para que la contraseña no se devuelva en las consultas por defecto
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    permission: {
        type: String,
        enum: ['Admin', 'Landors', 'Renters'],
        default: 'Landors'
    },
    rol: {
        type: String,
        enum: ['Admin', 'Landors', 'Renters'],
        default: 'Landors'
    },
    updated: {
        type: Date,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: false
    },
    birthdate: {
        type: Date,
        default: Date.now
    },
    verifyToken: String,
    verifyExpires: Date,
    passwordChangedAt: Date
}, {
    collection: 'user'
});

// Middleware para generar el campo 'codigo' antes de guardar
UserSchema.pre('save', async function(next) {
    // Solo generamos 'codigo' si el campo aún no tiene un valor
    if (!this.codigo) {
        this.codigo = this.email.slice(0, 2).toUpperCase() ; // Usando las dos primeras letras del email y parte de un UUID
    }
    next();
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Método para comparar contraseñas
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

// Método para verificar si la contraseña ha sido cambiada después de un cierto tiempo
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Método para generar un token único para restablecimiento de contraseña
UserSchema.methods.generatePasswordResetToken = function() {
    this.passwordResetToken = uuidv4();
    this.passwordResetExpires = Date.now() + 3600000; // 1 hora de expiración
    return this.passwordResetToken;
};

// Método para restablecer la contraseña
UserSchema.methods.resetPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
    this.passwordResetToken = null;
    this.passwordResetExpires = undefined;
    this.passwordChangedAt = new Date();
};

// Método para convertir el usuario a objeto JSON, excluyendo la contraseña
UserSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    delete userObject.verifyToken;
    delete userObject.verifyExpires;
    return userObject;
};

module.exports = mongoose.model('User', UserSchema);
