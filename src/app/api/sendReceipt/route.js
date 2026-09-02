import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuration du transporteur avec les identifiants Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    // Récupération des données envoyées par ton frontend
    const { email, customerName, orderId } = await request.json();

    const mailOptions = {
      from: `"Boutique T-Shirt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Merci pour ta commande, ${customerName} !</h2>
          <p>Ta commande de t-shirts <strong>#${orderId}</strong> est bien confirmée.</p>
          <p>Nous préparons ton colis avec soin. Tu recevras de nos nouvelles très vite !</p>
        </div>
      `,
    };

    // Envoi de l'e-mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "E-mail envoyé avec succès" });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
  }
}