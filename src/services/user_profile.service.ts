import { PrismaClient, UserProfile } from "@prisma/client";
import { Request, Response } from "express";
import { ExternalLoginAuthorizationService } from "./auth.service";

import { api, jwtAuthService, open } from "../routers";
import { RequestWithUser } from "./types";
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

interface UpdateIdentifier {
    // of current secret key using previous secret key
    signature: string;
    publicKey: string;
    secretKey: string;
}

const externalAuthService = new ExternalLoginAuthorizationService();
export class UserProfileService {


    constructor(private readonly prisma: PrismaClient) {}

    public async eoaExists(eoa: string): Promise<boolean> {
        return await this.prisma.userProfile.count({where: {eoa: eoa}}) !== 0;
    }

    public async _updateIdentifiers(userId: number, pubKey: string, secretKey: string) {
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

    public async createOrUpdateUser(eoa: string, pubKey: string, secretKey: string, isEOAWeb2: boolean, userId?: number) {
        if (userId === undefined) {
            return await this.createUser(eoa, pubKey, secretKey, isEOAWeb2);
        }
        return await this.prisma.userProfile.update({
            where: {
                id: userId
            },
            data: {
                eoa: eoa,
                pubKey: pubKey,
                secretKey: secretKey,
                isEOAWeb2: isEOAWeb2
            }
        })
    }


    getRouter() {
        open.post('/login', async (req, res) => {
            await this.login(req, res)
        });
        open.post('/login/eoa', async (req, res) => {
            const exists = await this.eoaExists(req.body.eoa);
            return res.status(200).send({
                data: {
                    exists
                }
            })
        })
        api.post('/user/ident', async (req: RequestWithUser, res) => {
            await this.updateIdentifiers(req, res);
        })
    }

    public async updateIdentifiers(req: RequestWithUser, res: Response) {
        
        const user = req.user as UserProfile;
        const body = req.body as UpdateIdentifier;
        const address = externalAuthService.getAddressFromPublicKey(body.publicKey);
        if (! await externalAuthService.verifySignature(address, body.secretKey, body.signature)) {
            return res.status(200).send({
                    err: 'Signature verification failed'
            });
        }
        await this._updateIdentifiers(user.id, body.publicKey, body.secretKey)
        return res.status(201);

    }


    public async login(req: Request, res: Response) {
        // const externalAuthService = new ExternalLoginAuthorizationService();
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
                return res.status(400).send({
                    err: 'Bad request'
                })
            }
            data.pubKey = body.pubKey;
            data.secretKey = body.secretKey;
        }else {
            const user = await this.prisma.userProfile.findFirst({where: {eoa: data.eoa} });
            return res.status(200).send({
                data: {
                    user: user,
                    token: jwtAuthService.generateAccessToken(user?.id.toString() as string)
                }
            })
        }


        if (body.route === 'wa') {
            
            
            if (! await externalAuthService.authenticateWeb3AuthCredentials(
                body.wa.idToken,
                body.wa.appPubKey
            )) {
                return res.status(401).send({
                    err: 'Authorization failed'
                })
            }
            data.isEOAWeb2 = body.wa.isEOAWeb2;
        }else {
            if (!await externalAuthService.authenticationUnstoppableDomainCredentials(
                body.eoa,
                body.ud.message,
                body.ud.signature
            )){
                return res.status(401).send({
                    err: 'Authorization failed'
                })
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