import { Request, Response } from 'express';
import { Rewards } from './rewards';
import { Server } from './server';

const server = new Server();
server.addRoute({
  path: '/',
  router: async (req: Request, res: Response) => {
    const { address = '0x8c5fa2057c41e77af5fac16448ae539abac6cd0e' } = req.query;
    const result = await new Rewards(address as string).execute();
    return res.json(result);
  },
});
server.start(process.env.PORT || 3001);
