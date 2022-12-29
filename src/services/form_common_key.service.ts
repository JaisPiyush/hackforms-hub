import { PrismaClient } from "@prisma/client";
import { FormShareLink, ResponseSchema } from "./types";
import { CommonService } from "./common.service";
import { Web3StorageDelegate } from "../storage/web3_storage";

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

    public async getFormShareLink(formId:string): Promise<ResponseSchema<FormShareLink>> {
        const formKey = await this.prisma.formCommonKey.findFirst({
            where: {
                formId: formId
            }
        })

        if (formKey === null) {
            return {
                status: 404,
                res:{
                    err: "No form found"
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