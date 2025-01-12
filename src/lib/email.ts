import { Resend } from "resend";
import ResetPasswordEmail from "@/emails/reset-password";
import { renderAsync } from "@react-email/render";

/**
 * Resend client instance for sending emails
 * @constant
 * @type {Resend}
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a password reset email using Resend
 *
 * @async
 * @function
 * @param {string} email - The recipient's email address
 * @param {string} resetLink - The password reset link with token
 * @returns {Promise<Object>} The Resend API response
 * @throws {Error} When email sending fails or rendering fails
 *
 * Features:
 * - Uses React Email for template rendering
 * - Proper error handling and logging
 * - Type-safe email template
 * - Fallback plain text version
 *
 * @example
 * ```ts
 * try {
 *   await sendPasswordResetEmail('user@example.com', 'https://example.com/reset?token=123');
 * } catch (error) {
 *   console.error('Failed to send reset email:', error);
 * }
 * ```
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    console.log("Generating email HTML...");
    const html = await renderAsync(ResetPasswordEmail({ resetLink }));
    console.log("HTML generated successfully");

    console.log("Sending email to:", email);
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: html,
      text: `Reset your password by clicking this link: ${resetLink}`, // Fallback plain text
    });

    if (error) {
      console.error("Resend API error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
