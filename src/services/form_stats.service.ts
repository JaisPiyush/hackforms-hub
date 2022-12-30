import { Form, PrismaClient } from "@prisma/client";
import { ResponseSchema } from "./types";


export class FormStatsService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createFormStats(form: Form) {



        return await this.prisma.formStats.create({
            data: {
                stats: {},
                form: {
                    connect: {
                        id: form.id
                    }
                }
            }
        })
    }

    public async updateFormStats(formId: string): Promise<ResponseSchema<boolean>> {
        const formStat = await this.prisma.formStats.findFirst({
            where: {
                formId: formId
            }
        })

        if (formStat == null) {
            return {
                status: 404,
                res: {
                    err: "Unable to form"
                }
            }
        }

        await this.prisma.formStats.update({
            where: {
                id: formStat.id
            },
            data: {
                numberOfResponse: formStat.numberOfResponse + 1
            }
        })

        return {
            status: 200,
            res: {
                data: true
            }
        }


    }
}