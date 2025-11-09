import {z} from 'zod';

export const MessageSchema = z.object({
content : z
    .string()
    .min(10, 'Message content must be at least 10 characters long')
    .max(500, 'Message content must be at most 500 characters long'),
    createdAt: z.date().default(
        () => new Date()
    )
});