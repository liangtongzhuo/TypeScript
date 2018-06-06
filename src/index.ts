import Koa from "koa";
import { Loader } from './loader';

const app = new Koa;

const loader = new Loader(app);

app.use(loader.loadRouter());

app.listen(3000, () => {
    console.log('服务器在运行');
})