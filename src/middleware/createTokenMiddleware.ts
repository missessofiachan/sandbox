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
        expiresIn: (process.env.JWT_EXPIRES_IN as StringValue) || '1h',
        algorithm: (process.env.JWT_ALGORITHM as jwt.Algorithm) || 'HS256',
    };

    // Sign and return the JWT
    return jwt.sign(payload, secret, options);
};

export default createToken;
