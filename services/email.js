let nodemailer = require('nodemailer');

require('dotenv').config();
const sendEmail = async (options) => {

    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Acepta certificados autofirmados
        }
    });
    console.log("options", options);
    let mailOptions = {
        from: `"KRUGER SCHOOL X" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.htmlContent, 
        headers: {
            "Content-Type": "text/html; charset=UTF-8",  // Encabezado Content-Type
          },
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email enviado");
    } catch (error) {
        console.log("Error al enviar el email", error);
    }
}
module.exports = sendEmail;
