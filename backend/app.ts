import * as express from 'express';
import * as exphbs from 'express-handlebars';
import { compose } from 'ramda';
import middleware from './middlewares';
import routes from './routes/index';
import database from './database';

const [before, after] = middleware;
const basePath = '/skillz';
const port = process.env.PORT || 3000;
const listen = app => app.listen(port, () =>
  console.log(`Skills Matrix listening on port ${port}`));
const addMiddleware = compose(listen, after, routes(basePath), before);

const app = express();

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', `${__dirname}/views`);

app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});

export default database.connect() && addMiddleware(app);
