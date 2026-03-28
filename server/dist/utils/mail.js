"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"Vruksha Composites" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verification Code for Vruksha Composites',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2e7d32; text-align: center;">Welcome to Vruksha Composites!</h2>
        <p>Thank you for choosing Vruksha Composites. Please use the following One-Time Password (OTP) to complete your account registration:</p>
        <div style="background-color: #f1f8e9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #1b5e20; border-radius: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #757575; text-align: center;">
          © 2026 Vruksha Composites. All rights reserved.
        </p>
      </div>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP Email sent: ' + info.response);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};
exports.sendOTP = sendOTP;
