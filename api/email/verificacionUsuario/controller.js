const sendEmail = require("../../../services/email");
const model = require("./model");

function generateValidationCode() {
  const length = 5;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}

function generateEmailContent(validationCode, isResend = false) {
  return `
  <html>
  <head>
    <style>
      /* Estilos globales para el cuerpo del correo */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
      }
      /* Estilos para el contenedor principal */
      .container {
        width: 100%;
        max-width: 600px; /* Ancho máximo recomendado para correos electrónicos */
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      /* Estilos para el encabezado del correo */
      .header {
        background-color: #007bff;
        color: white;
        text-align: center;
        padding: 20px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      /* Estilos para el título del encabezado */
      .title {
        font-size: 24px;
        font-weight: bold;
      }
      /* Estilos para el contenido del correo */
      .content {
        padding: 20px;
      }
      /* Estilos para el pie de página del correo */
      .footer {
        background-color: #f0f0f0;
        padding: 10px;
        text-align: center;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
    </style>
  </head>
  <body>
    <table class="container">
      <tr>
        <td class="header">
          <div class="title">KRUGER SCHOOL X</div>
          <div class="notificaciones">Notificaciones</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p>Estimado usuario,</p>
          <p>Tu ${isResend ? 'código de validación activo' : 'nuevo código de validación'} es: <strong>${validationCode}</strong></p>
          <p>Por favor, utilízalo para completar el proceso de verificación.</p>
          <p>Saludos,</p>
          <p>El equipo de tu aplicación</p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          &copy; ${new Date().getFullYear()} KRUGER SCHOOL X. Todos los derechos reservados.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}


exports.sendEmail = async (req, res) => {
  const email = req.body.email;

  try {
    if (!email) {
      return res.status(400).send("El campo de correo electrónico es requerido.");
    }

    // Generar un nuevo código de validación
    const validationCode = generateValidationCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Expira en 2 minutos

    // Crear o actualizar el registro de código de validación
    await model.findOneAndUpdate(
      { email: email },
      { email: email, validation_code: validationCode, expires_at: expiresAt },
      { upsert: true, new: true }
    );

    // Envío de correo electrónico con contenido HTML
    try {
      await sendEmail({
        email: email,
        subject: "Confirmación de correo electrónico",
        htmlContent: generateEmailContent(validationCode),
      });
      return res.status(200).json({
        status: "success",
        message: "Código de validación enviado por correo electrónico.",
      });
    } catch (emailError) {
      console.error("Error al enviar el correo electrónico:", emailError);
      return res.status(500).json({
        status: "error",
        message: "Error al enviar el correo electrónico. Inténtalo de nuevo más tarde.",
      });
    }

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al procesar la solicitud. Inténtalo de nuevo más tarde.",
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const email = req.params.email;
  const validationCode = req.params.codigo;
 console.log("email", email);
  try {
    if (!email || !validationCode) {
      return res.status(400).send("El correo electrónico y el código de validación son requeridos.");
    }

    // Buscar el registro de código de validación
    const result = await model.findOne({ email: email, validation_code: validationCode });

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Código de validación no encontrado o expirado.",
      });
    }

    // Eliminar el registro de código de validación
  //  await model.deleteMany({ email: email });

    return res.status(200).json({
      status: "success",
      message: "Correo electrónico verificado correctamente.",
    });
  } catch (error) {
    console.error("Error al verificar el correo electrónico:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al verificar el correo electrónico.",
    });
  }
};
