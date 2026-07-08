import { transporter } from "@/config/mail.js";
import { otpTemplate } from "@/templates/otp-template.js";

class MailService {
  async sendOTP(email: string, otp: string) {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Verification Code",
      html: otpTemplate(otp),
    });
  }
}

export const mailService = new MailService();
