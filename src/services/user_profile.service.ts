import { PrismaClient, UserProfile } from "@prisma/client";
import { Request, Response } from "express";
import { ExternalLoginAuthorizationService, JWTAuthenticationService } from "./auth.service";

import { jwtAuthService, open } from "../routers";
interface LoginArgs {
    route: "ud" | "wa",
    eoa: string;
    ud: {
        message: string;
        signature: string;
    },
    wa: {
        appPubKey: string;
        idToken: string;
        isEOAWeb2: boolean;
    },
    pubKey?: string;
    secretKey?: string;
}

export class UserProfileService {


    constructor(private readonly prisma: PrismaClient) {}

    public async eoaExists(eoa: string): Promise<boolean> {
        return await this.prisma.userProfile.count({where: {eoa: eoa}}) !== 0;
    }

    public async updateIdentifiers(userId: number, pubKey: string, secretKey: string) {
        return await this.prisma.userProfile.update({
            where: {id: userId}, 
            data: {
                pubKey: pubKey,
                secretKey: secretKey,
            }
        })
    }

    public async createUser(eoa: string, pubKey: string, privKey: string, isEOAWeb2: boolean) {
        return await this.prisma.userProfile.create({
            data: {
                eoa,
                pubKey,
                secretKey: privKey,
                isEOAWeb2
            }
        });
    }

    public async updateEOA(userId: number, eoa: string, isEOAWeb2: boolean) {
        return await this.prisma.userProfile.update({
            where:{
                id: userId
            },
            data: {
                eoa: eoa,
                isEOAWeb2
            }
        })
    }


    getRouter() {
        open.get('/login', this.login);
    }

    public async login(req: Request, res: Response) {
        const externalAuthService = new ExternalLoginAuthorizationService();
        if (req.headers['authorization']) {
            return jwtAuthService._authenticateToken(
                req, res, 
                () => {
                    const user = (req as any).user as UserProfile
                    return res.status(200).send({
                        data: {
                            user: user,
                            token: jwtAuthService.generateAccessToken(user.id.toString())
                        }
                    });
                }, 
                jwtAuthService.getKey() as string
            )
        }
        const body = req.body as LoginArgs;
        let data = {
            eoa: body.eoa
        } as any;

        if (!await this.eoaExists(data.eoa)) {
            if (body.pubKey === undefined || body.secretKey === undefined){
                return res.status(400).send('Bad request')
            }
            data.pubKey = body.pubKey;
            data.secretKey = body.secretKey;
        }


        if (body.route === 'wa') {
            
            
            if (! await externalAuthService.authenticateWeb3AuthCredentials(
                body.wa.idToken,
                body.wa.appPubKey
            )) {
                return res.status(401).send('Authorization failed')
            }
            data.isEOAWeb2 = body.wa.isEOAWeb2;
        }else {
            if (!await externalAuthService.authenticationUnstoppableDomainCredentials(
                body.eoa,
                body.ud.message,
                body.ud.signature
            )){
                return res.status(401).send('Authorization failed')
            }
            data.isEOAWeb2 = false
        }

        const user = await this.createUser(
            data.eoa, data.pubKey, data.secretKey, data.isEOAWeb2
        );

        return res.status(200).send({
            data: {
                user: user,
                token: jwtAuthService.generateAccessToken(user.id.toString())
            }
        })

        
    }
    


}