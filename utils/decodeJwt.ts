import jwt from 'jsonwebtoken';

export default function decodeJwt(token: string, secret: string, ignoreExpiration = false, maxAge?: string | number) {
    try {
        const decoded = jwt.verify(token, secret, { ignoreExpiration, maxAge });
        return decoded;
    } catch (error) {
        return false;
    }
}
