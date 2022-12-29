import { PrismaClient, UserProfile, Access as PrismaAccess, Form} from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { Web3StorageDelegate } from "../storage/web3_storage";
import { Response } from "express";

import { RequestWithUser, ResponseSchema, UpdateFormBody } from "./types";
import { CreateFormBody } from "./types";
import { FormCommonKeyService } from "./form_common_key.service";
import { FormStatsService } from "./form_stats.service";




export class FormService {

    constructor(
        private readonly prisma: PrismaClient,
        private readonly storage: Web3StorageDelegate,
        private readonly formCommonKeyService: FormCommonKeyService,
        private readonly formStateService: FormStatsService,
        ) {}

    public async generateFormId() {
        return uuidv4();
    }
    
    // Must throw error on failure
    private async beforeCreate(req: RequestWithUser, res: Response){
        return null;
    }

    private async beforeUpdate(req: RequestWithUser, res: Response){
        return null;
    }


    public async createFormHandler(req: RequestWithUser, res: Response){
        try {
            const user = req.user as UserProfile;
            const body = req.body as CreateFormBody;
            await this.beforeCreate(req, res);
            const formRes =  await this.createForm(user, body);
            // TODO: Send Invites
            return formRes
        }catch(e) {
            return res.status(400).send(`Error: ${(e as any).message}`);
        }

    }

    public async createForm(user: UserProfile, body: CreateFormBody ): Promise<ResponseSchema<Form>> {

            const meta = body.form.payload.meta;
            if (body.form.header.access !== PrismaAccess.public) {
                if (body.key === undefined) {
                    return {
                        status: 400,
                        res: {
                            err: "Common form encryption key is required"
                        }
                    };
                }
            }
            const name = `${meta.formId}.json`
            const cid = await this.storage.store(JSON.stringify(body.form), name);
            const form = await this.prisma.form.create({
                data: {
                    id: meta.formId,
                    title: meta.title,
                    cid: cid,
                    isClosed: meta.isClosed,
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    ownerEOA: user.eoa,
                    ownerpubKey: user.pubKey,
                    access: body.form.header.access
                }
            });

            await this.formStateService.createFormStats(form.id);

            if (body.form.header.access !== PrismaAccess.public) {
                await this.formCommonKeyService.createOrUpdateFormCommonKey(form.id, body.key as string);
            }
            
            
            return {
                status: 201,
                res:{
                    data: form
                }
            }

        
        

    }

    public async updateFormHandler(req: RequestWithUser, res: Response) {
        try {
            const user = req.user as UserProfile;
            const body = req.body as CreateFormBody;
            await this.beforeUpdate(req, res);
            const formRes =  await this.updateForm(user, body);
            // TODO: Send Invites
            return formRes
        }catch(e) {
            return res.status(400).send(`Error: ${(e as any).message}`);
        }
    }

    public async updateForm(user: UserProfile, body: UpdateFormBody): Promise<ResponseSchema<Form>> {
        const meta = body.form.payload.meta;
        if (body.form.header.access !== PrismaAccess.public) {
            if (body.key === undefined) {
                return {
                    status: 400,
                    res: {
                        err: "Common form encryption key is required"
                    }
                };
            }
        }
        const name = `${meta.formId}.json`
        const cid = await this.storage.store(JSON.stringify(body.form), name);
        const form = await this.prisma.form.update({
            where: {
                id: meta.formId
            },
            data:{
                cid: cid,
                title: meta.title,
                updatedOn: new Date(Date.now()).toDateString(),
                ownerpubKey: user.pubKey,
                access: body.form.header.access
            }
        })
        if (body.form.header.access !== PrismaAccess.public) {
            await this.formCommonKeyService.createOrUpdateFormCommonKey(form.id, body.key as string);
        }

        return {
            status: 200,
            res:{
                data: form
            }
        }

    }


}