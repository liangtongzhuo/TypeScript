import Controller from '../common/baseController';

export default class User extends Controller {
  async user() {
    this.ctx.body = this.ctx.service.check.index();
  }
  async userInfo() {
    this.ctx.body = this.app.config.middleware[0];
  }
}
