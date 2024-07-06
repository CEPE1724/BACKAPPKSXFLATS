
const model = require("./model");

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
