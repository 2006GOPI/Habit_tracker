const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        console.log('Attempting to send email...');
        console.log('Email User configured:', process.env.EMAIL_USER ? 'YES' : 'NO');
        console.log('Email Pass configured:', process.env.EMAIL_PASS ? 'YES' : 'NO');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('================================================');
            console.log('EMAIL CONFIG MISSING - MOCKING EMAIL SEND');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            console.log('================================================');
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to ' + to);
    } catch (error) {
        console.log('================================================');
        console.log('EMAIL SEND FAILED - FALLBACK LOG');
        console.log(`To: ${to}`);
        console.log(`Body: ${text}`);
        console.error('Error details:', error.message);
        console.log('================================================');
        // Do not throw error so registration flow can continue in dev mode
    }
};

module.exports = sendEmail;
