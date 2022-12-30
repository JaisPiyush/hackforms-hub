import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

export async function generateRandomUser(prisma: PrismaClient){
    return await prisma.userProfile.create({
        data: {
            eoa: uuidv4(),
            pubKey: uuidv4(),
            secretKey: uuidv4(),
            isEOAWeb2: false
        }
    })
}


export async function deleteRandomUser(userId: number, prisma: PrismaClient) {
    
    const deleteFormResponse = prisma.form.deleteMany({
        where: {
            userId: userId
        }
    })
    
    const deleteForm = prisma.form.deleteMany({
        where:{
            userId: userId
        }
    });

    
    const deleteUserProfile = prisma.userProfile.delete({
        where: {
            id: userId
        }
    })
    return await prisma.$transaction([deleteFormResponse, deleteForm, deleteUserProfile])
}