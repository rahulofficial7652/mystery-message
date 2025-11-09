import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();  // Connect to MongoDB
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error("No user found with the provided email or username");
                    }
                    if (user.isVerified === false) {
                        throw new Error("User email is not verified");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                    return user

                } catch (error) {
                    throw new Error("Error during authorization");

                }
            },
        }),
    ],
  callbacks:{
    async jwt({ token, session }) {
        if(user){
            token._id = user._id?.toString();
        }
        return token;
    },
    async session({session, token}) {

  },
    pages:{
        signIn: '/sign-in',
    },
    session:{
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};