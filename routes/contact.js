const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validation des données du formulaire
const validateContactForm = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('message').trim().isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères')
];

// Route pour envoyer un email
router.post('/', validateContactForm, async (req, res) => {
  try {
    // Vérifier s'il y a des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    // Options de l'email
    const mailOptions = {
      from: `"Formulaire de contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Vous recevrez l'email à votre adresse
      replyTo: email,
      subject: `Nouveau message de ${name}`,
      html: `
        <h3>Nouveau message du formulaire de contact</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Réponse réussie
    res.status(200).json({
      success: true,
      message: 'Votre message a été envoyé avec succès! Je vous répondrai dès que possible.'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.'
    });
  }
});

module.exports = router;