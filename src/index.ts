import "reflect-metadata";

import express from 'express';
import { PrismaClient } from "@prisma/client";
import { JWTAuthenticationService } from "./services/auth.service";
import { CommonService } from "./services/common.service";
import {FormStatsService} from './services/form_stats.service'
import { NotificationService } from "./services/notification.service";
import { FormResponseService } from "./services/form_response";
import { Web3StorageDelegate } from "./storage/web3_storage";
import { FormCommonKeyService } from "./services/form_common_key.service";
import { FormService } from "./services/form.service";

const prisma = new PrismaClient();
const commonService = new CommonService();
const storage = new Web3StorageDelegate()
const jWTAuthenticationService = new JWTAuthenticationService(prisma);
const formStatsService = new FormStatsService(prisma);
const formCommonKeyService = new FormCommonKeyService(prisma, storage)
const notificationService = new NotificationService(prisma);
const formResponseService = new FormResponseService(prisma, storage, formStatsService);
const formService = new FormService(prisma, storage, formCommonKeyService, formStatsService)



async function bootstrap() {
    const app = express();
    app.use(express.json())
    formService.bindHandlers(app);
    formResponseService.bindHandlers(app);
    notificationService.bindHandlers(app);
    return app;
}


bootstrap().then((app) => {
    app.listen(3000)
    console.log('Running server')
})



