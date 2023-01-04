import { PrismaClient, UserProfile, Access as PrismaAccess, FormResponse, Form } from "@prisma/client";
import { Web3StorageDelegate } from "../storage/web3_storage";
import { v4 as uuidv4 } from 'uuid';
import { CreateFormResponseBody, GetFormResponse, RequestWithUser, ResponseSchema, SerializedFormResponse } from "./types";
import { FormStatsService } from "./form_stats.service";
import {Express} from 'express'
import { getFormattedResponseFormSchema } from "./common.service";
import { api, open } from "../routers";


type FormatFormResponse = (Pick<FormResponse, "cid" | "id"> & {form: Pick<Form, "title" | "cid" | "id" >})

export class FormResponseService {

    constructor(
        private readonly prisma: PrismaClient,
        private readonly storage: Web3StorageDelegate,
        private readonly formStateService: FormStatsService,
    ){}


    public generateFormResponseId() {
        return uuidv4();
    }



    private formateFormResponses(formResponses: FormatFormResponse[]): GetFormResponse[] {
        return formResponses.map((formRes) => {
            return {
                formResponse: {
                    title: formRes.form.title,
                    formId: formRes.form.id,
                    formCid: formRes.form.cid,
                    responseId: formRes.id,
                    cid: formRes.cid
                },
                responseContentUrl: this.storage.getUrl(formRes.cid),
                formContentUrl: this.storage.getUrl(formRes.form.cid)
            }
        });
    }



    bindHandlers() {
        open.get('/api/response/:id', async (req, res) => {
            const id = req.params.id
            const formResponse = await this.getFormResponses(id);
            return getFormattedResponseFormSchema(res, formResponse);
        });
        api.get('/response/all', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const responses = await this.getAllUserFormResponses(user.id);
            return getFormattedResponseFormSchema(res, responses);
        });
        api.post('/response', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const body = req.body as CreateFormResponseBody;
            const form = await this.createResponse(user, body);
            return getFormattedResponseFormSchema(res, form)
        })

        api.get('/response/formId/:formId', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const  formId = req.params.formId
            const formResponse = await this.getUserResponseForFormId(user.id, formId);
            return getFormattedResponseFormSchema(res, formResponse);
        })
        
    }


    public async getAllUserFormResponses(userId: number): Promise<ResponseSchema<GetFormResponse[]>> {
        const formResponses = await this.prisma.formResponse.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                cid: true,
                form: {
                    select: {
                        id: true,
                        cid: true,
                        title: true
                    }
                }
            }
        });

        return {
            status: 200,
            res: {
                data: this.formateFormResponses(formResponses)
            }
        }
    }


    public async getUserResponseForFormId(userId:number, formId: string): Promise<ResponseSchema<GetFormResponse>> {
        const formResponse = await this.prisma.formResponse.findFirst({
            where: {
                AND: [
                    {
                        formId: formId
                    },{
                        userId: userId
                    }
                ]
            },
            select: {
                id: true,
                cid: true,
                form: {
                    select: {
                        cid: true,
                        id: true,
                        title: true
                    }
                    
                }
            }
        });
        if (formResponse === null) {
            return {
                status: 404,
                res: {
                    err: "No form response found"
                }
            }
        }
        return {
            status: 200,
            res:{
                data: this.formateFormResponses([formResponse])[0]
            }
        }

    }

    public async getFormResponses(responseId: string): Promise<ResponseSchema<GetFormResponse>> {
        const formResponse = await this.prisma.formResponse.findFirst({
            where: {
                    id: responseId
            },
            select: {
                id: true,
                cid: true,
                form: {
                    select: {
                        cid: true,
                        id: true,
                        title: true
                    }
                    
                }
            }
        });
        if (formResponse === null) {
            return {
                status: 404,
                res: {
                    err: "No form response found"
                }
            }
        }
        return {
            status: 200,
            res:{
                data: this.formateFormResponses([formResponse])[0]
            }
        }
    }




    public async createResponse(user: UserProfile, body: CreateFormResponseBody): Promise<ResponseSchema<SerializedFormResponse>>{
        const formResponseId = this.generateFormResponseId();
        body.formResponse.payload.meta.responseId = formResponseId;
        body.formResponse.payload.iss = user.pubKey;
        body.formResponse.payload.owner = user.eoa;
        const name = `${formResponseId}.json`
        const cid = await this.storage.store(JSON.stringify(body.formResponse), name);
        const formResponse = await this.prisma.formResponse.create({
            data: {
                id: formResponseId,
                cid: cid,
                ownerEOA: user.eoa,
                ownerpubKey: user.pubKey,
                user: {
                    connect: {
                        id: user.id
                    }
                },
                form: {
                    connect: {
                        id: body.formResponse.payload.meta.formId
                    }
                }
            }
        });

        await this.formStateService.updateFormStats(body.formResponse.payload.meta.formId);
        return {
            status: 201,
            res:{
                data: {
                    formResponse: formResponse,
                    rawContentUrl: this.storage.getUrl(cid)
                }
            }
        }

        
    }
}