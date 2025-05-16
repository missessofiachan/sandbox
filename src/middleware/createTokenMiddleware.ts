// Middleware to create a JWT token for a user
import jwt from 'jsonwebtoken';
import { IUser } from '../types';
import type { StringValue } from 'ms';

interface TokenUser {
    username: string;
    id?: string;
    role?: string;
    email?: string;
}

// Improved: Do not include password in token payload, use env SECRET_KEY, add user id if available
const createToken = (user: TokenUser | IUser): string => {
    // Build payload with username and optional id
    const payload = {
        email: user.email,
        role: user.role || 'user',
        userId: (user as IUser)._id?.toString() || user.id
    };

    // Use SECRET_KEY from .env, fallback to 'defaultsecret' if not set
    const secret = process.env.SECRET_KEY || 'defaultsecret';
    const options = {
        expiresIn: '1h' as StringValue,
        algorithm: 'HS256' as const,
    };

    // Sign and return the JWT
    return jwt.sign(payload, secret, options);
};

export default createToken;
