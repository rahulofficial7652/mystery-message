import { Message } from "@/model/User";


export interface ApiResponse {
    success: boolean;
    message: string;
    isAccespetingMessage?: boolean
    messages? :Array<Message>;
}