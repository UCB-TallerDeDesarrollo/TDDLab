import express from 'express';
import bodyParser from 'body-parser';
import server from './config/server'
import router from './adapters/routes/userRoutes'

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api/user', router);

server(app, port);
