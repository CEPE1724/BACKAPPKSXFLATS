const Provincia = require("../provincia/model");

exports.getAll = async (req, res) => {
    try {
        console.log("Obteniendo todas las provincias...");
        
        // Obtener todas las provincias desde la base de datos
        const provincias = await Provincia.find();

        console.log("Provincias encontradas:", provincias); // Agrega este mensaje de depuración

        // Devolver las provincias como respuesta en formato JSON
        res.json(provincias);
    } catch (error) {
        // Manejar cualquier error y devolver un mensaje de error adecuado
        console.error('Error al obtener provincias:', error);
        res.status(500).json({ message: 'Error al obtener provincias' });
    }
};
