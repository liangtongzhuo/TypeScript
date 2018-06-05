import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa;
const route = new Router;

route.get('/', async (ctx, next) => {
    ctx.body = 'hello ts-koa  6666';
})

app.use(route.routes());

app.listen(3000, '127.0.0.1', () => {
    console.log('服务器在运行');
})