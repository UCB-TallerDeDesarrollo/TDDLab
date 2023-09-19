import { Express } from 'express';

function server(app: Express, port: number): void {
  app.listen(port, () => {
    console.log(`Servidor de prueba escuchando en http://localhost:${port}`);
  });
}

export default server;