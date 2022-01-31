import express from 'express'

export class Server {
  app: express.Application
  constructor() {
    this.app = express()
  }

  start(port: number | string) {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  }
  
  addRoute(route: any) {
    this.app.use(route.path, route.router)
  }
}
