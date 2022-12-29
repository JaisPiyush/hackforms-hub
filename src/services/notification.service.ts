import { PrismaClient } from "@prisma/client";

export class NotificationService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createNotification(formId: string, userId: string) {
        const notif = await this.prisma
    }

}