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

const formatMontant = (value) => {
  const nombre = Number(value ?? 0);
  return `${nombre.toFixed(2).replace('.', ',')} $`;
};

export async function POST(request) {
  try {
    const {
      email,
      customerName,
      orderId,
      total,
      items = [],
    } = await request.json();

    const nom = customerName || 'Client';
    const lignesHtml = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #3b3b3b;">
                  ${item.name || item.nom || 'Article'}
                  ${item.size ? `- Taille ${item.size}` : ''}
                  ${item.qty ? `x${item.qty}` : ''}
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #3b3b3b;">
                  ${formatMontant(item.price ?? item.prixUnitaire ?? 0)}
                </td>
              </tr>
            `
          )
          .join('')
      : `
        <tr>
          <td style="padding: 10px 0; color: #3b3b3b;">Commande enregistrée</td>
          <td style="padding: 10px 0; text-align: right; color: #3b3b3b;">${formatMontant(total)}</td>
        </tr>
      `;

    const mailOptions = {
      from: `"Boutique T-Shirt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1f2937;">
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">Bonjour ${nom},</h2>

            <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">
              Nous vous confirmons que votre commande a bien été enregistrée et que votre paiement a été reçu avec succès.
            </p>

            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6;">
              <strong>Numéro de commande :</strong> ${orderId}
            </p>
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #4b5563;">
              Veuillez conserver ce numéro pour tout besoin de suivi concernant votre commande.
            </p>

            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
              <strong>Détails de votre commande :</strong>
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
              <tbody>
                ${lignesHtml}
              </tbody>
            </table>

            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; text-align: right;">
              <strong>Montant payé : ${formatMontant(total)}</strong>
            </p>

            <h3 style="margin: 0 0 12px; font-size: 20px; color: #111827;">Récupération de votre commande</h3>

            <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">
              La récupération des commandes se fera sur place, lors du camp.
            </p>

            <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6;">
              Si vous êtes STAR, vous pourrez récupérer votre commande à partir du 8 octobre.
            </p>

            <p style="margin: 0; font-size: 15px; line-height: 1.6;">
              À bientôt,<br />
              L’équipe du Camp Impact ADN
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'E-mail envoyé avec succès' });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
  }
}