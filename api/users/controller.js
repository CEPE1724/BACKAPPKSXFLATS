
const model = require("./model");
const Flats = require("../flats/model");
const Favorites = require("../favoriteFlats/model");
const User = require('../users/model');
const Message = require('../message/model');

exports.create = async (req, res) => {
    const { email, password } = req.body;

    try {
        let updateFields = { email: email };

        // Si password no está vacío, actualiza también la contraseña
        if (password) {
            updateFields.password = password;
        }

        const user = new model(updateFields);
        await user.save();

        return res.status(201).json({
            status: "success",
            message: "Usuario creado correctamente.",
        });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al crear el usuario. Inténtalo de nuevo más tarde.",
        });
    }
};

exports.updateUser = async (req, res) => {
    const { firstName, lastName, email, birthdate, rol, password } = req.body;

    try {
        // Verifica que al menos uno de los campos a actualizar esté presente en la solicitud
        if (!firstName && !lastName && !email && !birthdate && !rol && !password) {
            return res.status(400).json({
                status: "error",
                message: "No se proporcionaron campos para actualizar.",
            });
        }

        // Construye el objeto de campos a actualizar
        let updateFields = {};
        if (firstName) {
            updateFields.firstName = firstName;
        }
        if (lastName) {
            updateFields.lastName = lastName;
        }
        if (email) {
            updateFields.email = email;
        }
        if (birthdate) {
            updateFields.birthdate = new Date(birthdate); 
        }
        if (rol) {
            updateFields.rol = rol;
        }
        if (password) {
            // Hashear la nueva contraseña antes de actualizarla
            updateFields.password = await model.hashPassword(password);
        }

        // Busca y actualiza el usuario en la base de datos
        const userId = req.params.id;
        const user = await model.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado.",
            });
        }

        return res.status(200).json({
            status: "success",
            data: user,
            message: "Usuario actualizado correctamente.",
        });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el usuario. Inténtalo de nuevo más tarde.",
        });
    }
};

exports.findById = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
        // Selecciona explícitamente los campos que deseas devolver, incluyendo 'password'
        const user = await model.findById(id).select('email firstName lastName permission rol created updated birthdate avatar password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Construye el objeto de datos del usuario con los campos seleccionados
        const userData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            permission: user.permission,
            rol: user.rol,
            created: user.created,
            updated: user.updated,
            birthdate: user.birthdate,
            avatar: user.avatar,
            password: (user.password), // Incluye el campo 'password'
        };

        return res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    const { searchTerm, sortOrder, minFlatsCount, maxFlatsCount } = req.query;
    console.log("searchTerm:", searchTerm);
    console.log("sortOrder:", sortOrder);
    console.log("minFlatsCount:", minFlatsCount);
    console.log("maxFlatsCount:", maxFlatsCount);
    try {
        // Obtener el valor mínimo de flatsCount
        const minCount = await User.findOne({})
            .sort({ flatsCount: 1 })
            .select('flatsCount')
            .limit(1);

        // Obtener el valor máximo de flatsCount
        const maxCount = await User.findOne({})
            .sort({ flatsCount: -1 })
            .select('flatsCount')
            .limit(1);

        let filter = {};
        if (searchTerm) {
            // Aplicar búsqueda por firstName o lastName con regex insensible a mayúsculas y minúsculas
            filter.$or = [
                { firstName: { $regex: new RegExp(searchTerm, 'i') } },
                { lastName: { $regex: new RegExp(searchTerm, 'i') } }
            ];
        }

        // Filtrar por rango de flatsCount si se proporcionan minFlatsCount y/o maxFlatsCount
        if (minFlatsCount || maxFlatsCount) {
            filter.flatsCount = {};
            if (minFlatsCount) {
                filter.flatsCount.$gte = parseInt(minFlatsCount);
            } else {
                filter.flatsCount.$gte = minCount.flatsCount; // Usar el valor mínimo obtenido
            }
            if (maxFlatsCount) {
                filter.flatsCount.$lte = parseInt(maxFlatsCount);
            } else {
                filter.flatsCount.$lte = maxCount.flatsCount; // Usar el valor máximo obtenido
            }
        }

        let sortCriteria = { firstName: 1 }; // Orden por defecto: firstName ascendente
        if (sortOrder === 'desc') {
            sortCriteria = { firstName: -1 }; // Ordenar por firstName descendente si sortOrder es 'desc'
        } else if (sortOrder === 'favorites') {
            sortCriteria = { favoritesCount: 1 }; // Ordenar por favoritesCount ascendente si sortOrder es 'favorites'
        } 

        // Obtener todos los usuarios que coincidan con el filtro y ordenar según sortCriteria
        const users = await User.find(filter).sort(sortCriteria);

        // Iterar sobre cada usuario para obtener el número de flats y favorites
        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const flatsCount = await Flats.countDocuments({ user: user._id });
            const favoritesCount = await Favorites.countDocuments({ user: user._id , status: "active" });

            // Crear objeto de usuario con conteo de flats y favorites
            const userWithCounts = {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                permission: user.permission,
                rol: user.rol,
                created: user.created,
                updated: user.updated,
                birthdate: user.birthdate,
                avatar: user.avatar,
                password: user.password,
                flatsCount: flatsCount,
                favoritesCount: favoritesCount
            };

            return userWithCounts;
        }));

        // Devolver la lista de usuarios con conteos de flats y favorites
        return res.status(200).json(usersWithCounts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};






exports.filterUsers = async (req, res) => {
    const { email, firstName, lastName, rol } = req.query;

    try {
        let filter = {};

        // Construir el objeto de filtro con los campos proporcionados
        if (email) {
            filter.email = { $regex: new RegExp(email, 'i') }; // Búsqueda insensible a mayúsculas y minúsculas
        }
        if (firstName) {
            filter.firstName = { $regex: new RegExp(firstName, 'i') };
        }
        if (lastName) {
            filter.lastName = { $regex: new RegExp(lastName, 'i') };
        }
        if (rol) {
            filter.rol = rol;
        }

        // Consulta a la base de datos usando el modelo
        const users = await model.find(filter).sort({ firstName: 1 }); // Ordenar por nombre ascendente

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {

    const { id } = req.params;
    console.log(id);

    try {
        const user = await model.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const flats = await Flats.find({ user: id });
        if (flats.length > 0) {
            await Flats.deleteMany({ user: id });
        }

        const favorites = await Favorites.find({ user: id });
        if (favorites.length > 0) {
            await Favorites.deleteMany({ user: id });
        }

        const messages = await Message.find({ _idUsuarioEnvia: id });
        if (messages.length > 0) {
            await Message.deleteMany({ _idUsuarioEnvia: id });
        }

        const messagesRecibe = await Message.find({ _idUsuarioRecibe: id });
        if (messagesRecibe.length > 0) {
            await Message.deleteMany({ _idUsuarioRecibe: id });
        }


        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}


const bcrypt = require('bcryptjs'); // Importa bcrypt para el hash de contraseñas


const generateRandomCode = () => {
    const length = 7;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const charactersLength = characters.length;
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
};

exports.saveResetPassword = async (req, res) => {
    const { email } = req.params; // Obtén el email del parámetro de la URL

    try {
        // Buscar al usuario por su correo electrónico
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generar el código aleatorio para la nueva contraseña
        const resetCode = generateRandomCode();

        // Actualizar la contraseña directamente con el código aleatorio
        user.password = resetCode;
        user.passwordChangedAt = new Date(); // Registrar la fecha de cambio de contraseña

        console.log('Reset code:', resetCode);
        // Guardar el usuario actualizado en la base de datos
        await user.save();

        res.status(200).json({ message: 'Password updated successfully', resetCode });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Failed to update password', error });
    }
};