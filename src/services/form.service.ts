import { PrismaClient, UserProfile, Access as PrismaAccess, Form} from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { Web3StorageDelegate } from "../storage/web3_storage";
import { Response } from "express";
import {Express} from 'express'
import { GetFormStatusBody, RequestWithUser, ResponseSchema, SerializedForm, SerializedFormAnalytics, UpdateFormBody } from "./types";
import { CreateFormBody } from "./types";
import { FormCommonKeyService } from "./form_common_key.service";
import { FormStatsService } from "./form_stats.service";
import { getFormattedResponseFormSchema } from "./common.service";




export class FormService {

    constructor(
        private readonly prisma: PrismaClient,
        private readonly storage: Web3StorageDelegate,
        private readonly formCommonKeyService: FormCommonKeyService,
        private readonly formStateService: FormStatsService,
        ) {}

    public generateFormId() {
        return uuidv4();
    }
    
    // Must throw error on failure
    private async beforeCreate(req: RequestWithUser, res: Response){
        return null;
    }

    private async beforeUpdate(req: RequestWithUser, res: Response){
        return null;
    }


    bindHandlers(app: Express): Express {
        app.post('/form/create', this.createFormHandler);
        app.post('/form/update', this.updateFormHandler);
        app.get('/form/:formId', async (req, res) => {
            const formId = req.params.formId;
            const form = await this.getForm(formId)
            return getFormattedResponseFormSchema(res, form);
        });
        app.get('/form/all', async (req: RequestWithUser, res) => {
            const userId = req.user?.id as number;
            const forms = await this.getAllFormsOfUser(userId);
            return getFormattedResponseFormSchema(res, forms);
        });

        app.post('/form/status', async (req, res) => {
            const formIds = (req.body as GetFormStatusBody).formIds;
            const forms = await this.getFormStatus(formIds);
            return getFormattedResponseFormSchema(res, forms);
        });

        app.get('/form/analytics/:formId', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const formStat = await this.getFormAnalytics(user.id, req.params.formId);
            return getFormattedResponseFormSchema(res, formStat);
        })

        return app;
    }


    public async createFormHandler(req: RequestWithUser, res: Response){
        try {
            const user = req.user as UserProfile;
            const body = req.body as CreateFormBody;
            await this.beforeCreate(req, res);
            const formRes =  await this.createForm(user, body);
            // TODO: Send Invites
            return getFormattedResponseFormSchema(res, formRes)
        }catch(e) {
            return res.status(400).send(`Error: ${(e as any).message}`);
        }

    }

    public async createForm(user: UserProfile, body: CreateFormBody ): Promise<ResponseSchema<SerializedForm>> {
            
            const formId = this.generateFormId();
            body.form.payload.meta.formId = formId;
            body.form.payload.iss = user.pubKey;
            body.form.payload.owner = user.eoa;
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

            await this.formStateService.createFormStats(form);

            if (body.form.header.access !== PrismaAccess.public) {
                await this.formCommonKeyService.createOrUpdateFormCommonKey(form.id, body.key as string);
            }
            
            
            return {
                status: 201,
                res:{
                    data: {
                        form: form,
                        rawContentUrl: this.storage.getUrl(form.cid)
                    }
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
            return getFormattedResponseFormSchema(res, formRes);
        }catch(e) {
            return res.status(400).send(`Error: ${(e as any).message}`);
        }
    }

    public async updateForm(user: UserProfile, body: UpdateFormBody): Promise<ResponseSchema<SerializedForm>> {
        body.form.payload.iss = user.pubKey;
        body.form.payload.owner = user.eoa;
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
                data: {
                    form: form,
                    rawContentUrl: this.storage.getUrl(form.cid)
                }
            }
        }

    }

    public async getForm(formId: string): Promise<ResponseSchema<SerializedForm>> {
        const form = await this.prisma.form.findFirst({
            where: {
                id: formId
            }
        })

        if (form === null) {
            return {
                status: 404,
                res: {
                    err: "No form found"
                }
            }
        }
        return {
            status: 200,
            res: {
                data: {
                    form: form,
                    rawContentUrl: this.storage.getUrl(form.cid)
                }
            }
        }
    }

    public async getAllFormsOfUser(userId: number): Promise<ResponseSchema<SerializedForm[]>> {
        
        // TODO: Add Pagination
        const forms = await this.prisma.form.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                title: true,
                cid: true,
                isClosed: true,
                createdOn: true,
                access: true
            }
        });

        return {
            status: 200,
            res:  {
                data: forms.map((form) => {
                    return {
                        form: form,
                        rawContentUrl: this.storage.getUrl(form.cid)
                    }
                })
            }
        }

    }

    // API used to load not owned forms data in bulk for e.g from notifications
    public async getFormStatus(formIds: string[]): Promise<ResponseSchema<SerializedForm[]>> {
        const forms = await this.prisma.form.findMany({
            where: {
                id: {
                    in: formIds
                }
            },
            select: {
                id: true,
                createdOn: true,
                title: true,
                cid: true,
                isClosed: true,
                access: true
            }
        });
        return {
            status: 200,
            res: {
                data: forms.map((form) => {
                    return {
                        form: form,
                        rawContentUrl: this.storage.getUrl(form.cid)
                    }
                })
            }
        }
    }

    public async getFormAnalytics(userId: number, formId: string): Promise<ResponseSchema<SerializedFormAnalytics>> {
        const formStat = await this.prisma.formStats.findFirst({
            where: {
                AND: [
                    {
                        formId: formId
                    },
                    {
                        form:{
                            userId: userId
                        }
                    }
                ]
            },
            select: {
                numberOfResponse: true
            }
        });

        if (formStat === null) {
            return {
                status: 404,
                res: {
                    err: "No form found"
                }
            }
        }

        const formRes = await this.prisma.formResponse.findMany({
            where: {
                formId: formId
            },
            select: {
                cid: true,
                id: true
            },
            orderBy: {
                createdOn: 'desc'
            }
        });

        return {
            status: 200,
            res: {
                data: {
                   numberOfResponse: formStat.numberOfResponse,
                    responses: formRes.map((res) => {
                        return {
                            id: res.id,
                            cid: res.cid,
                            url: this.storage.getUrl(res.cid)
                        }
                    })
                }
            }
        }
    }


}