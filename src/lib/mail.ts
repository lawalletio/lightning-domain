import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PASSWORD, SMTP_USERNAME } from '~/constants/constants';

export interface IContent {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}
export async function sendEmergencyEmail(content: IContent) {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, // Replace with your SMTP server
    port: 587, // Common ports are 465 (SSL) and 587 (TLS)
    secure: false, // True for 465, false for other ports
    auth: {
      user: SMTP_USERNAME, // Your SMTP username
      pass: SMTP_PASSWORD, // Your SMTP password
    },
  });

  // Email options;

  // Send the email
  try {
    const info = await transporter.sendMail(content);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
}
