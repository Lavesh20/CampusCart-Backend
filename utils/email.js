const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (email, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"Your Name" <${process.env.EMAIL}>`,
            to: email,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};

module.exports = { sendEmail };