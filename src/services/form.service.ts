import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

export class FormService {
    
    constructor(private readonly prisma: PrismaClient) {}

    public async getFormId() {
        return uuidv4();
    }
}