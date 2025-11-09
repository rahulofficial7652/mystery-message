import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VerificatiobEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { tr } from "zod/locales";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Mystery message verification email',
      react: VerificationEmail({ username, otp:verifyCode }),
    });
         return {
            success: true,
            message: "success to send verification email.",
        };
        
    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            success: false,
            message: "Failed to send verification email.",
        };
    }

}