import * as jwt from 'jsonwebtoken';
import {randomBytes} from 'crypto';
import {Request, Response, NextFunction} from  'express'
import { PrismaClient, UserProfile } from '@prisma/client';
import * as jose from 'jose';
import { RequestWithUser } from './types';
import * as EthCrypto from 'eth-crypto';




export class JWTAuthenticationService {

    constructor(private readonly prisma: PrismaClient){}

    public static generateRandomKey(): string {
        return randomBytes(64).toString('hex');
    }

    public getKey() {
        return process.env.JWT_TOKEN;
    }

    public _generateAccessToken(claim: Record<string, string> | string, key: string, expiresIn: number) {
        if (key === undefined){
            throw Error('JWT encryption key is not set')
        }
        //TODO: add expires in
        return jwt.sign(claim, key);
    }

    public generateAccessToken(userId: string, expiresIn = 864000) {
        return this._generateAccessToken(userId, this.getKey() as string, expiresIn);
    }

    public _authenticateToken(req: Request, res: Response, callback: () => void, key: string) {
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
            callback()
        })
    }

    public authenticateToken(req: Request, res: Response, next: NextFunction){
        return this._authenticateToken(req, res, next, this.getKey() as string);
    }

    public getUserFromRequest(req: RequestWithUser, res: Response) {
        if (req.user === undefined) {
            return res.status(401).send("Authentication of user failed. Try to login again")
        }
        return req.user;
    }

}


export class ExternalLoginAuthorizationService {

    async authenticateWeb3AuthCredentials(idToken: string, appPubKey: string): Promise<boolean> {
        const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
        const jwtDecoded = await jose.jwtVerify(idToken, 
                    jwks,
                    {algorithms: ['ES256']}
                );
            console.log((jwtDecoded as any).payload.wallets[0].public_key);
            
        return (jwtDecoded as any).payload.wallets[0].public_key === appPubKey;
    }

    getAddressFromPublicKey(address: string) {
        return EthCrypto.publicKey.toAddress(address)
    }

    async verifySignature(address: string, message: string, signature: string) {
        const prefixedMessage = `\x19Ethereum Signed Message:\n${message.length}${message}`
        return (await EthCrypto.recover(signature, EthCrypto.hash.keccak256(prefixedMessage))) === address;
    }

    async authenticationUnstoppableDomainCredentials(eoa: string, message: string, signature: string) {
        message = atob(message);
        return await this.verifySignature(eoa, message, signature);
    }


}