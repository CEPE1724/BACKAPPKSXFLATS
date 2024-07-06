const Favorite = require('../favoriteFlats/model');

exports.createFavorite = async (req, res) => {
    const { flat, user, status } = req.body;

    try {
        // Buscar si ya existe un favorito con la misma combinación de flat y user
        let existingFavorite = await Favorite.findOne({ flat: flat, user: user });

        if (existingFavorite) {
            // Si existe, actualizar el favorito con los datos proporcionados
            existingFavorite.status = status || existingFavorite.status; // Mantener el estado actual si no se proporciona uno nuevo
            await existingFavorite.save();

            return res.status(200).json({
                status: 'success',
                message: 'Favorito actualizado correctamente.',
                favorite: existingFavorite,
            });
        } else {
            // Si no existe, crear un nuevo favorito con los datos proporcionados
            const newFavorite = new Favorite({
                flat: flat,
                user: user,
                status: status || 'active', // Establecer como 'active' si no se proporciona status
            });

            await newFavorite.save();

            return res.status(201).json({
                status: 'success',
                message: 'Favorito creado correctamente.',
                favorite: newFavorite,
            });
        }
    } catch (error) {
        console.error('Error al crear o actualizar el favorito:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear o actualizar el favorito. Inténtalo de nuevo más tarde.',
        });
    }
};

exports.getFavorites = async (req, res) => {
    const { user, flat } = req.params;
   console.log(user, flat);
    try {
        // Buscar favoritos por user y flat
        let favorites = await Favorite.find({ user: flat, flat: user, status: 'active'});
        console.log(favorites);
        console.log(favorites.length > 0 ? "ok" : "ko");
        return res.status(200).json({
            status: 'success',
            message: 'Favoritos encontrados correctamente.',
            favorites: favorites,
            search: favorites.length > 0 ? "ok" : "ko",
        });
    } catch (error) {
        console.error('Error al buscar favoritos:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al buscar favoritos. Inténtalo de nuevo más tarde.',
        });
    }
};

exports.getAllFavorites = async (req, res) => {
    const { user } = req.params;

    try {
        // Buscar todos los favoritos activos de un usuario
        let favorites = await Favorite.find({ user: user, status: 'active' }).populate({
            path: 'flat',
            populate: {
                path: 'user',
                select: '_id email avatar firstName lastName',
            },
        });

        // Mapear los resultados para devolver la estructura deseada
        favorites = favorites.map((favorite) => ({
            _id: favorite.flat._id,
            areaSize: favorite.flat.areaSize,
            city: favorite.flat.city,
            dateAvailable: favorite.flat.dateAvailable,
            hasAc: favorite.flat.hasAc,
            rentPrice: favorite.flat.rentPrice,
            streetName: favorite.flat.streetName,
            streetNumber: favorite.flat.streetNumber,
            user: {
                _id: favorite.flat.user._id,
                email: favorite.flat.user.email,
                avatar: favorite.flat.user.avatar,
                firstName: favorite.flat.user.firstName,
                lastName: favorite.flat.user.lastName,
            },
            yearBuilt: favorite.flat.yearBuilt,
            __v: favorite.flat.__v,
        }));

        /*return res.status(200).json({
            status: 'success',
            message: 'Favoritos encontrad edison.',
            favorites: favorites,
        });*/
        return res.status(200).json(favorites);
    } catch (error) {
        console.error('Error al buscar favoritos:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al buscar favoritos. Inténtalo de nuevo más tarde.',
        });
    }
};
