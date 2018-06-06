import fs from "fs";
import Router from "koa-router";
import { BaseContext } from "koa";
import Koa from "koa";

const dirname = __dirname + '/..'

export class Loader {
  router = new Router();
  controller = {};
  app: Koa;

  constructor(app: Koa) {
    this.app = app;
  }

  loadConfig() {
    const configDef = dirname + "/config/config.default.js";
    const configEnv =
      dirname +
      (process.env.NODE_ENV === "production"
        ? "/config/config.pro.js"
        : "/config/config.dev.js");
    const conf = require(configEnv);
    const confDef = require(configDef);
    const merge = Object.assign({}, conf, confDef);
    Object.defineProperty(this.app, "config", {
      get: () => {
        return merge;
      }
    });
  }

  loadService() {
    const service = fs.readdirSync(dirname + "/service");
    var that = this;
    Object.defineProperty(this.app.context, "service", {
      get() {
        if (!(<any>this)["cache"]) {
          (<any>this)["cache"] = {};
        }
        const loaded = (<any>this)["cache"];
        if (!loaded["service"]) {
          loaded["service"] = {};
          service.forEach(d => {
            const name = d.split(".")[0];
            const mod = require(dirname + "/service/" + d);
            loaded["service"][name] = new mod(this, that.app); //注意这里传入
          });
          return loaded.service;
        }
        return loaded.service;
      }
    });
  }

  loadController() {
    const dirs = fs.readdirSync(dirname + "/controller");
    dirs.forEach(filename => {
      const property = filename.split(".")[0];
      const mod = require(dirname + "/controller/" + filename).default;
      if (mod) {
        const methodNames = Object.getOwnPropertyNames(mod.prototype).filter(
          names => {
            if (names !== "constructor") {
              return names;
            }
          }
        );
        Object.defineProperty(this.controller, property, {
          get() {
            const merge: { [key: string]: any } = {};
            methodNames.forEach(name => {
              merge[name] = {
                type: mod,
                methodName: name
              };
            });
            return merge;
          }
        });
      }
    });
  }

  loadRouter() {
    this.loadConfig();
    this.loadService();
    this.loadController();
    const mod = require(dirname + "/router.js");
    const routers = mod(this.controller);
    Object.keys(routers).forEach(key => {
      const [method, path] = key.split(" ");

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
