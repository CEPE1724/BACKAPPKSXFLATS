const Message = require("../message/model");
const User = require("../users/model");
const Flat = require("../flats/model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


exports.create = async (req, res) => {
  try {
    console.log(req.body);

    const {
      content,
      _idUsuarioEnvia,
      _idUsuarioRecibe,
      idFlat,
      city,
      streetName,
      streetNumber,
    } = req.body;

    // Check if _id is provided and is a valid ObjectId
    const messageId = req.body._id;
    if (messageId && !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid _id provided" });
    }

    // Check if the ID exists
    if (messageId) {
      const existingMessage = await Message.findById(messageId);
      if (existingMessage) {
        // Update the existing message
        await Message.updateOne(
          { _id: messageId },
          {
            content,
            _idUsuarioEnvia,
            _idUsuarioRecibe,
            idFlat,
            city,
            streetName,
            streetNumber,
          }
        );
        return res
          .status(200)
          .json({ message: "Message updated successfully" });
      }
    }

    // Create the message
    const message = await Message.create({
      content,
      _idUsuarioEnvia,
      _idUsuarioRecibe,
      idFlat,
      city,
      streetName,
      streetNumber,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAll = async (req, res) => {
  try {
    const messages = await Message.find();
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getById = async (req, res) => {
  const { idUsuarioRecibe } = req.params;

  try {
    // Obtener datos del usuario que recibe el mensaje
    const user = await User.findOne({ _id: idUsuarioRecibe });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Obtener todos los flats asociados al usuario
    const flats = await Flats.find({ user: idUsuarioRecibe });
    if (!flats || flats.length === 0) {
      return res.status(404).json({ message: "Flats not found for this user" });
    }

    // Array para almacenar la información combinada de usuario y flats
    const userWithFlats = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      // Incluir otros campos necesarios del usuario
      flats: [],
    };

    // Iterar sobre los flats y agregarlos al array de flats del usuario
    for (let i = 0; i < flats.length; i++) {
      const flat = flats[i];
      // Obtener mensajes asociados a este flat y usuario
      const messages = await Message.find({
        _idUsuarioRecibe: idUsuarioRecibe,
        idFlat: flat._id,
      });

      // Contar los mensajes
      const messageCount = messages.length;

      // Agregar el flat al array de flats del usuario
      userWithFlats.flats.push({
        _id: flat._id,
        name: flat.name,
        // Incluir otros campos necesarios del flat
        messageCount: messageCount,
      });
    }

    return res.status(200).json(userWithFlats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getFlatsWithMessageCountByUser = async (req, res) => {
  const { idUsuarioRecibe } = req.params; // ID del usuario que recibe los mensajes

  try {
    // Paso 1: Buscar todos los mensajes recibidos por el usuario específico
    const messages = await Message.find({ _idUsuarioRecibe: idUsuarioRecibe });

    // Paso 2: Obtener los IDs únicos de los flats donde se recibieron mensajes
    const flatIdsWithMessages = [
      ...new Set(messages.map((message) => message.idFlat.toString())),
    ];

    // Paso 3: Contar los mensajes por cada flat
    const messageCountByFlat = {};
    messages.forEach((message) => {
      const idFlat = message.idFlat.toString();
      if (messageCountByFlat[idFlat]) {
        messageCountByFlat[idFlat]++;
      } else {
        messageCountByFlat[idFlat] = 1;
      }
    });

    // Paso 4: Buscar los detalles de los flats correspondientes
    const flats = await Flat.find({
      _id: { $in: flatIdsWithMessages },
    }).populate("user");

    // Paso 5: Obtener los IDs únicos de los usuarios que enviaron los mensajes
    const userIds = [
      ...new Set(messages.map((message) => message._idUsuarioEnvia.toString())),
    ];

    // Paso 6: Buscar la información de los usuarios que enviaron los mensajes
    const users = await User.find({ _id: { $in: userIds } });

    // Construir la respuesta final combinando información de flats, usuarios y mensajes
    const response = flats.map((flat) => {
      const flatData = {
        _id: flat._id,
        areaSize: flat.areaSize,
        city: flat.city,
        canton: flat.canton,
        dateAvailable: flat.dateAvailable,
        hasAc: flat.hasAc,
        rentPrice: flat.rentPrice,
        streetName: flat.streetName,
        streetNumber: flat.streetNumber,
        yearBuilt: flat.yearBuilt,
        user: {
          _id: flat.user._id,
          email: flat.user.email,
          firstName: flat.user.firstName,
          lastName: flat.user.lastName,
          avatar: flat.user.avatar,
        },
        messageCount: messageCountByFlat[flat._id.toString()] || 0,
      };

      // Encontrar el usuario que envió el último mensaje a este flat
      const lastMessage = messages.find(
        (message) => message.idFlat.toString() === flat._id.toString()
      );
      if (lastMessage) {
        const sendingUser = users.find(
          (user) =>
            user._id.toString() === lastMessage._idUsuarioEnvia.toString()
        );
        if (sendingUser) {
          flatData.sendingUser = {
            _id: sendingUser._id,
            email: sendingUser.email,
            firstName: sendingUser.firstName,
            lastName: sendingUser.lastName,
            avatar: sendingUser.avatar,
          };
        }
      }

      return flatData;
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getMessagesByParams = async (req, res) => {
  const { idUsuarioRecibe, idUsuarioEnvia, idflat } = req.params;
  

  try {
    // Obtener mensajes por parámetros
    const messages = await Message.find({
      _idUsuarioRecibe: idUsuarioRecibe,
      _idUsuarioEnvia: idUsuarioEnvia,
      idFlat: idflat
    }).sort({ createdAt: -1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}