const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendSystemMail(to, subject, htmlContent) {
    try {
        const transporter = nodemailer.createTransport({
    host: "://hostinger.com", // Change this to your business email host server
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.BUSINESS_EMAIL, // e.g. support@nextgennutrifit.com
        pass: process.env.BUSINESS_PASSWORD 
    }
});


        const mailOptions = {
    // A clean name helps avoid immediate automated blocks
    from: `"NextGenNutriFit Engine" <${process.env.APP_EMAIL}>`, 
    to: to,
    subject: subject,
    html: htmlContent
};


        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully dispatched to ${to}:`, info.response);
        return { success: true, response: info.response };
        
    } catch (error) {
        console.error(`Nodemailer transport pipeline failure targeting ${to}:`, error);
        throw error; 
    }
}

// Exports the function so server.js can use it easily
module.exports = sendSystemMail; 
