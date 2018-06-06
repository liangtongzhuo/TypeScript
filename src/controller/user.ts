import { Controller } from "./base";

export default class User extends Controller {
    async user() {
        this.ctx.body = this.ctx.service.check.index();
    }

    getConfig() {
        return this.app.config;
    }

    async userInfo() {
        this.ctx.body = this.getConfig().middleware[0];//注意这里
    }
}