import { PrismaClient } from "@prisma/client";

interface CreateUserArg {
    eoa: string;
    pubKey: string;
    secretKey: string;
}

export class UserProfileService {


    constructor(private readonly prisma: PrismaClient) {}

    public async eoaExists(eoa: string): Promise<boolean> {
        return await this.prisma.userProfile.count({where: {eoa: eoa}}) !== 0;
    }

    public async updateIdentifiers(userId: number, pubKey: string, secretKey: string) {
        return await this.prisma.userProfile.update({
            where: {id: userId}, 
            data: {
                pubKey: pubKey,
                secretKey: secretKey,
            }
        })
    }

    


}