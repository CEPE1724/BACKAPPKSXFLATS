const User = require('../users/model');
const jwt = require('jsonwebtoken');
require('dotenv').config();
exports.validateExistEmail = async (req, res) => {
    try {
        const email = req.params.email;
        console.log(email);

        const user = await User.findOne({ email }).exec();
        console.log(user);

        if (user) {
            return res.status(200).json({ message: 'Email already exists', exist: true });
        } else {
            return res.status(200).json({ message: 'Email is available', exist: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password').exec();

        if (user && user.comparePassword(password)) {
            // Generar un token JWT
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Cambia el tiempo de expiración según tus necesidades

            // Enviar la respuesta con el token y el usuario (sin incluir la contraseña)
            return res.status(200).json({ message: 'User found', user: user.toJSON(), token });
        } else {
            return res.status(404).json({ message: 'User not found or invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
