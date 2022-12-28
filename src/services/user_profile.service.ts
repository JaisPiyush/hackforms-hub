import { PrismaClient } from "@prisma/client";

interface CreateUserArg {
    eoa: string;
    pubKey: string;
    secretKey: string;
}

export class UserProfileService {
    constructor(private readonly prisma: PrismaClient) {}

    public async createUser(data: CreateUserArg) {
        const user = await this.prisma.userProfile.create({
            data: {
                eoa: data.eoa,
                pubKey: data.pubKey,
                secretKey: data.secretKey
            }
        });
        return user;
    }

    public async updateIdentifiers(id: number, pubKey: string, secretKey: string) {
        const user = await this.prisma.userProfile.update({
            where: {
                id: id
            },
            data: {
                pubKey: pubKey,
                secretKey: secretKey
            }
        });
        return user;
    }
}