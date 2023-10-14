import { Express } from 'express';

function server(app: Express, port: number): void {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

export default server;