import { PrismaClient } from "@prisma/client";

export class NotificationService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createNotification(formId: string, userId: number) {
        const notif = await this.prisma.notification.create({
            data: {
                userId: userId,
            }
        })
        return notif
    }

    // public async getUsersNotifications(userId: number): 

}