import { Notification, PrismaClient, UserProfile } from "@prisma/client";
import { RequestWithUser, ResponseSchema } from "./types";
import { Express } from "express";
import { getFormattedResponseFormSchema } from "./common.service";
import { api } from "../routers";

export class NotificationService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createNotification(formId: string, userId: number) {
        const notif = await this.prisma.notification.create({
            data: {
                userId: userId,
                form: {
                    connect: {
                        id: formId
                    }
                }
            }
        })
        return notif
    }


    bindHandlers() {
        api.get('/notifications', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const notifs = await this.getUsersNotifications(user.id);
            return getFormattedResponseFormSchema(res, notifs);
        });
        api.delete('/notifications/:id', async (req: RequestWithUser, res) => {
            const user = req.user as UserProfile;
            const id = parseInt(req.params.id);
            const status = await this.removeNotification(user.id, id);
            return getFormattedResponseFormSchema(res, status);
        });
    }

    
    public async removeNotification(userId: number, notiId: number): Promise<ResponseSchema<boolean>> {
        const noti = await this.prisma.notification.deleteMany({
            where: {
                AND: [
                    {
                        id: notiId
                    },
                    {
                        userId: userId
                    }
                ]

            }
        });

        if ( noti.count === 0) {
            return {
                status: 400,
                res: {
                    err: "Failed to update notification"
                }
            }
        }
        return {
            status: 200,
            res: {
                data: true
            }
        }
    }


    public async getUsersNotifications(userId: number): Promise<ResponseSchema<Notification[]>> {
        const notifications = await this.prisma.notification.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdOn: 'desc'
            },
            take: 10
        });
        return {
            status: 200,
            res: {
                data: notifications
            }
        }
    }

}