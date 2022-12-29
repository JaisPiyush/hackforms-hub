import { PrismaClient, UserProfile, Access as PrismaAccess, FormResponse, Form } from "@prisma/client";
import { Web3StorageDelegate } from "../storage/web3_storage";
import { v4 as uuidv4 } from 'uuid';
import { CreateFormResponseBody, GetFormResponse, ResponseSchema, SerializedFormResponse } from "./types";
import { FormStatsService } from "./form_stats.service";


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
        const meta = body.formResponse.payload.meta;
        const name = `${formResponseId}.json`
        const cid = await this.storage.store(JSON.stringify(formResponseId), name);
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