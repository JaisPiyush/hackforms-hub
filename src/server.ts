import "reflect-metadata";





import express from 'express';

import { JWTAuthenticationService } from "./services/auth.service";
import { CommonService } from "./services/common.service";
import {FormStatsService} from './services/form_stats.service'
import { NotificationService } from "./services/notification.service";
import { FormResponseService } from "./services/form_response.service";
import { Web3StorageDelegate } from "./storage/web3_storage";
import { FormCommonKeyService } from "./services/form_common_key.service";
import { FormService } from "./services/form.service";
import { api, open, prisma } from "./routers";
import { UserProfileService } from "./services/user_profile.service";
import morgan from 'morgan'
import cors from 'cors';

const commonService = new CommonService();
const storage = new Web3StorageDelegate()
const jWTAuthenticationService = new JWTAuthenticationService(prisma);
const formStatsService = new FormStatsService(prisma);
const formCommonKeyService = new FormCommonKeyService(prisma, storage)
const notificationService = new NotificationService(prisma);
const formResponseService = new FormResponseService(prisma, storage, formStatsService);
const formService = new FormService(prisma, storage, formCommonKeyService, formStatsService)

const userProfileService = new UserProfileService(prisma)

export const services = {
    prisma,
    commonService,
    storage,
    jWTAuthenticationService,
    formCommonKeyService,
    formStatsService,
    notificationService,
    formResponseService,
    formService
}

const app = express();
app.use(morgan('dev'))
app.use(cors({
    origin: '*'
}))
app.use(express.json())
app.options('*',cors())


userProfileService.binHandlers()
formService.bindHandlers();
formResponseService.bindHandlers();
notificationService.bindHandlers();

app.use('/', open);
app.use('/api', api)




export {app};