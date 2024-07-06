const Message = require("../message/model");


const mongoose = require("mongoose");

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
            return res.status(200).json({ message: "Message updated successfully" });
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