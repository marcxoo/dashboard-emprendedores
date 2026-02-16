import { Resend } from 'resend';

// Initialize Resend with the API key
// Ideally, this should be in process.env.RESEND_API_KEY
// For this environment, we'll try to read it from env, or fallback if needed (though env is best practice)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production to your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, html, text, bcc } = req.body;

        if ((!to && !bcc) || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields: to/bcc, subject, html' });
        }

        const emailPayload = {
            from: 'Emprendimiento UNEMI <onboarding@resend.dev>', // Change this to your verified domain later
            to: to,
            subject: subject,
            html: html,
            text: text || ''
        };

        if (bcc) {
            emailPayload.bcc = bcc;
        }

        // If 'to' is missing but 'bcc' exists (common for bulk), Resend might require 'to'.
        // Usually safe to send 'to' as the sender or a noreply if strictly bulk.
        // For now assuming 'to' is passed or Resend handles bcc-only if allowed.

        const { data, error } = await resend.emails.send(emailPayload);

        if (error) {
            console.error('Resend Error:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Email sent successfully', data });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
