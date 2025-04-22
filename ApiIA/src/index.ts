import { App } from "./aplication/app";

const PORT = parseInt(process.env.PORT || '3000');
const app = new App();
app.start(PORT);