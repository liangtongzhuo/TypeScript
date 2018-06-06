import { BaseContext } from 'koa';
import Koa from 'koa';

interface App extends Koa {
  config: any;
}

export default class Service {
  ctx: BaseContext;
  app: App;
  constructor(ctx: BaseContext, app: App) {
    this.ctx = ctx;
    this.app = app;
  }
}