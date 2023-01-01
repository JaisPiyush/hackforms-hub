import { PrismaClient } from '@prisma/client';
import express from 'express';
import { JWTAuthenticationService } from './services/auth.service';


export const prisma = new PrismaClient();
export const jwtAuthService = new JWTAuthenticationService(prisma)

export const open = express.Router();
export const api = express.Router();
api.use((req, res, next) => {
    jwtAuthService.authenticateToken(req, res, next);
})