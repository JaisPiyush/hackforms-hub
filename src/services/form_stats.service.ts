import { PrismaClient } from "@prisma/client";


export class FormStatsService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createFormStats(formId: string) {
        return await this.prisma.formStats.create({
            data: {
                stats: {},
                form: {
                    connect: {
                        id: formId
                    }
                }
            }
        })
    }
}