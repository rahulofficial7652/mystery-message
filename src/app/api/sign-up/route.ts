import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { success } from "zod";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await req.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        // check via username
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already taken"
            }, { status: 400 })
        }
        // check via email
        const existingUserVerifiedByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            if (existingUserVerifiedByEmail) {
                if(existingUserVerifiedByEmail.isVerified) {
                    return Response.json({
                        success: false,
                        message: "Email is already registered"
                    }, { status: 400 })
                }
                else{
                const hashedPassword = await bcrypt.hash(password, 10); 
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCodeExpires = new Date(Date.now() + 3600000)
                await existingUserVerifiedByEmail.save();
                }
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1)
                const newUser = new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    verifyCode,
                    verifyCodeExpiresAt: expiryDate,
                    isVerified: false,
                    isAcceptingMessages: true,
                    messages: [],                    
                })
                await newUser.save()
            }
            // send verification email
            const emailResponse = await sendVerificationEmail(email, username, verifyCode);

            if(!emailResponse.success) {
                return Response.json({
                    success: false,
                    message: "Username is already taken"
                }, { status: 500 })
            }
            return Response.json({
                success: true,
                message: "User registered successfully. Verification email sent."
            }, { status: 201 })

    } catch (error) {
        console.error("Error during sign-up:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal Server Error"
            }),
            { status: 500 }
        );
    }
}