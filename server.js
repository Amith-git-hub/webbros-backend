require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using a different provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Connection Error (Check credentials):', error);
    } else {
        console.log('SMTP Server is ready to take our messages.');
    }
});

// API endpoint to handle contact submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate Input
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    try {
        // Construct the email options
        const mailOptions = {
            from: `"${name}" <${email}>`, // Note: Gmail often overrides this with the authenticated user's address to prevent spoofing
            replyTo: email,
            to: process.env.EMAIL_USER, // Send email to the company address
            subject: `WebBros New Inquiry from: ${name}`,
            text: `You have a new website inquiry.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6366f1;">New Website Inquiry Details</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        // Return success response to the frontend
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`WebBros Server running on http://localhost:${PORT}`);
});
