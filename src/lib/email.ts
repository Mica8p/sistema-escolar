import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const fromEmail = process.env.EMAIL_USER!;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Restablece tu contraseña',
      html: `
        <h1>Restablece tu contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Si no solicitaste esto, por favor ignora este correo.</p>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // You might want to throw the error or handle it as needed
    throw new Error('Could not send password reset email.');
  }
};
