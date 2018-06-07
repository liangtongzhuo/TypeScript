import fs from 'fs';
import Router from 'koa-router';
import { BaseContext } from 'koa';
import Koa from 'koa';

const dirname = __dirname + '/..';

/**
 * 用于加载
 */
export class Loader {
  router = new Router();
  controller = {};
  app: Koa;

  constructor(app: Koa) {
    this.app = app;
  }
  /**
   * 环境变量加载配置，绑定在 App ，初始化加载一次。
   */
  loadConfig() {
    const fileName = process.env.NODE_ENV || 'default';
    const configPath = `${dirname}/config/config.${fileName}.js`;
    const conf = require(configPath);
    Object.defineProperty(this.app, 'config', {
      get: () => {
        return conf;
      },
    });
  }
  /**
   * 加载 Service ，生命周期根据 context 周期同步，每一个请求都会加载。
   */
  loadService() {
    const service = fs.readdirSync(dirname + '/service');
    var that = this;
    Object.defineProperty(this.app.context, 'service', {
      get() {
        if (!(<any>this)['cache']) {
          (<any>this)['cache'] = {};
        }
        const loaded = (<any>this)['cache'];
        if (!loaded['service']) {
          loaded['service'] = {};
          service.forEach(d => {
            const name = d.split('.')[0];
            const mod = require(dirname + '/service/' + d);
            loaded['service'][name] = new mod(this, that.app);
          });
          return loaded.service;
        }
        return loaded.service;
      },
    });
  }
  /**
   * 加载控制器，跟随路由加初始化加载。
   */
  loadController() {
    const dirs = fs.readdirSync(dirname + '/controller');
    dirs.forEach(filename => {
      const property = filename.split('.')[0];
      const mod = require(dirname + '/controller/' + filename).default;
      if (mod) {
        const methodNames = Object.getOwnPropertyNames(mod.prototype).filter(names => {
          if (names !== 'constructor') {
            return names;
          }
        });
        Object.defineProperty(this.controller, property, {
          get() {
            const merge: { [key: string]: any } = {};
            methodNames.forEach(name => {
              merge[name] = {
                type: mod,
                methodName: name,
              };
            });
            return merge;
          },
        });
      }
    });
  }

  loadRouter() {
    this.loadConfig();
    this.loadService();
    this.loadController();
    const mod = require(dirname + '/router.js');
    const routers = mod(this.controller);
    Object.keys(routers).forEach(key => {
      const [method, path] = key.split(' ');
      // 每一次请求都会调用，与 context 生命周期同步 
      (<any>this.router)[method](path, async (ctx: BaseContext) => {
        const _class = routers[key].type;
        const handler = routers[key].methodName;
        const instance = new _class(ctx, this.app);
        instance[handler]();
      });
    });
    return this.router.routes();
  }
}
