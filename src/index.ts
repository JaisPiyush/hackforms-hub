import "reflect-metadata";

import express from 'express';


async function bootstrap() {
    const app = express();
    app.use(express.json())
    return app;
}


bootstrap().then((app) => {
    app.listen(3000)
    console.log('Running server')
})



