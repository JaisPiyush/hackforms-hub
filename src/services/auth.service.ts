import * as jwt from 'jsonwebtoken';
import {randomBytes} from 'crypto';
import {Request, Response, NextFunction} from  'express'
import { PrismaClient } from '@prisma/client';


export class JWTAuthenticationService {

    constructor(private readonly prisma: PrismaClient){}

    public generateRandomKey(): string {
        return randomBytes(64).toString('hex');
    }

    public getKey() {
        return process.env.JWT_TOKEN;
    }

    public _generateAccessToken(claim: Record<string, string> | string, key: string, expiresIn: string) {
        if (key === undefined){
            throw Error('JWT encryption key is not set')
        }
        return jwt.sign(claim, key, {expiresIn});
    }

    public generateAccessToken(userId: string, expiresIn: string = '10d') {
        return this._generateAccessToken(userId, this.getKey() as string, expiresIn);
    }

    public _authenticateToken(req: Request, res: Response, next: NextFunction, key: string) {
        const header = req.headers['authorization'];
        const token = header && header.split(' ')[1];
        
        if (token == null) return res.sendStatus(401);

        jwt.verify(token, key, async (err, userId) => {
            if (err) {
                console.log(err);
                return res.sendStatus(403);
            }
            const user = await this.prisma.userProfile.findFirst({where: {id: parseInt(userId as string)}})
            if (user == null) {
                return res.status(404).send("No user found associated with the credentials")
            }
            (req as any).user = user;
            next()
        })
    }

    public authenticateToken(req: Request, res: Response, next: NextFunction){
        return this._authenticateToken(req, res, next, this.getKey() as string);
    }

}