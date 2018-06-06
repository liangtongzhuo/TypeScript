import { BaseContext } from "koa";
import Koa from "koa";

interface SelfBaseContext extends BaseContext {
  service: any;
}

interface App extends Koa {
  config: any;
}

export class Controller {
  ctx: SelfBaseContext;
  app: App;
  constructor(ctx: SelfBaseContext, app: App) {
    this.ctx = ctx;
    this.app = app;
  }
}
