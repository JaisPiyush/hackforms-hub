import { PrismaClient } from "@prisma/client";

interface CreateUserArg {
    eoa: string;
    pubKey: string;
    secretKey: string;
}

export class UserProfileService {
    constructor(private readonly prisma: PrismaClient) {}

    
}