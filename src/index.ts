import { Request, Response } from "express";
import { Server } from "./server";
import { Rewards } from "./rewards";

const server = new Server();
server.addRoute({
  path: "/",
  router: async (req: Request, res: Response) => {
    const result = await new Rewards(req.query.address as string).execute();
    return res.json(result);
  },
});
server.start(process.env.PORT || 3001);
