import { PrismaClient, Access as PrismaAccess, UserProfile } from "@prisma/client";
import { FormShareLink, RequestWithUser, ResponseSchema } from "./types";
import { Web3StorageDelegate } from "../storage/web3_storage";
import { Express } from "express";
import { getFormattedResponseFormSchema } from "./common.service";
import { api } from "../routers";

export class FormCommonKeyService {
    constructor(private readonly prisma: PrismaClient,
        private readonly storage: Web3StorageDelegate
        ) {}

    public async createOrUpdateFormCommonKey(formId: string, key:string) {
        const form =  await this.prisma.formCommonKey.findFirst({
            where: {
                formId: formId
            }
        })
        
        if (form === null) {
            return await this.prisma.formCommonKey.create({
                data: {
                    formId:formId,
                    key: key
                }
            })
        }else {
            return await this.prisma.formCommonKey.update({
                where: {
                    id: form.id
                },
                data: {
                    key: key
                }
            })
        }
    }

    bindHandlers() {
        api.get('/form/share/:formId', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const formId = req.params.formId;
            const shareData = await this.getFormShareLink(user.id, formId);
            return getFormattedResponseFormSchema(res, shareData);
        });
    }

    public async getFormShareLink(userId: number, formId:string): Promise<ResponseSchema<FormShareLink>> {
        const formKey = await this.prisma.formCommonKey.findFirst({
            where: {
                AND: [{
                    formId: formId
                },
                {
                    form: {
                        userId: userId
                    }
                },
                {
                    form: {
                        access: PrismaAccess.private
                    }
                }
            ]

            }
        })

        if (formKey === null) {
            return {
                status: 404,
                res:{
                    err: "Share link generation failed"
                }
            }
        }

        return {
            status: 200,
            res: {
                data: {
                    url: `/published/${formId}?access=${formKey.key}`
                }
            }
        }
    }
}