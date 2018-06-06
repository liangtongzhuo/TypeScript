"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
const constructorType = 'constructor';
class Loader {
    constructor() {
        this.router = new koa_router_1.default;
        this.controller = {};
    }
    loadController() {
        const dirs = fs_1.default.readdirSync(__dirname + '/controller');
        dirs.forEach((filename) => {
            const mod = require(__dirname + '/controller/' + filename).default;
            if (mod) {
                //对象自身的属性的属性名组成的数组
                const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
                    if (names !== constructorType) {
                        return names;
                    }
                });
                const prop = filename.split('.')[0];
                // controller 上的 prop 熟悉调用则会调用 get 方法
                Object.defineProperty(this.controller, prop, {
                    get() {
                        const merge = {};
                        methodNames.forEach((name) => {
                            merge[name] = {
                                Class: mod,
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
        this.loadController();
        const mod = require(__dirname + '/router.js');
        const routers = mod(this.controller);
        Object.keys(routers).forEach((key) => {
            const [method, path] = key.split(' ');
            // router 收到请求，下面则会被调用
            this.router[method](path, async (ctx) => {
                const Class = routers[key].Class;
                const handler = routers[key].methodName;
                const instance = new Class(ctx);
                instance[handler]();
            });
        });
        return this.router.routes();
    }
}
exports.Loader = Loader;
