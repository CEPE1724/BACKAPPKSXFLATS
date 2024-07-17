const Canton = require("../canton/model");

exports.getAll = async (req, res) => {
    const idProvincia = req.params.idProvincia;
    try {
        console.log("Obteniendo todos los cantones...");

        let query = {};
        if (idProvincia !== '0') {
            query = { idProvincia: idProvincia };
            console.log("Filtrando por provincia con ID:", idProvincia);
        } else {
            console.log("No se especificó ID de provincia, obteniendo todos los cantones.");
        }

        const cantones = await Canton.find(query);

        console.log("Cantones encontrados:", cantones);

        res.json(cantones);
    } catch (error) {
        console.error('Error al obtener cantones:', error);
        res.status(500).json({ message: 'Error al obtener cantones' });
    }
};
