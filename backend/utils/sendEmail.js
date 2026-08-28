const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
  console.log("📧 [EMAIL] Starting email sending process...");
  console.log("📧 [EMAIL] Target:", options.email);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.verify();
    console.log("📧 [EMAIL] SMTP verified.");

    const mailOpts = {
      from: `"TIC Academy" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOpts);

    console.log("📧 [EMAIL] Envelope:", info.envelope);
    console.log("📧 [EMAIL] Accepted:", info.accepted);
    console.log("📧 [EMAIL] Rejected:", info.rejected);
    console.log("📧 [EMAIL] Pending:", info.pending);
    console.log("📧 [EMAIL] Response:", info.response);

    return info;

  } catch (err) {
    console.log("❌ [EMAIL ERROR] Message:", err.message);
    console.log("❌ [EMAIL ERROR] Full:", err);
    throw err;
  }
};

module.exports = sendEmail;
