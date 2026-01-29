'use server';

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  // Ici, on simule l'envoi d'email vers o.tenasoa@gmail.com
  console.log(`📧 Simulation d'envoi d'email :
    De : ${name} (${email})
    Sujet : ${subject || 'Sans sujet'}
    Message : ${message}
    Destinataire : o.tenasoa@gmail.com
  `);

  // Dans une vraie implémentation, vous utiliseriez 'resend' ou 'nodemailer' ici
  // const { data, error } = await resend.emails.send({ ... });

  return { success: 'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.' };
}
