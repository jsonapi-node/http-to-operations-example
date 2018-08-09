import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from 'koa-router';
import _ from 'lodash';

const app = new Koa();
app.use(logger());
app.use(cors());
app.use(bodyParser());

const config = {
  port: process.env.PORT || 3000
};

const router = new Router();

const splitQueryParamValue = (queryParam) => {
  if (!queryParam) {
    return undefined;
  }

  const splits = queryParam.split(',');

  return splits.length === 1 ? splits[0] : splits;
}
const getFilters = (query) => {
  return _.chain(query)
    .keys()
    .filter(key => key.match(/^filter\[(.*)\]$/))
    .reduce((result, filterKey) => {
      const key = filterKey.replace(/^filter\[(.*)\]$/, "$1");

      return { ...result, [key]: splitQueryParamValue(query[filterKey]) };
    }, {})
    .value();
};

router.get('/:resource', async (ctx) => {
  const include = splitQueryParamValue(ctx.query.include);
  const filters = getFilters(ctx.query);
  debugger;

  const operation = {
    op: 'get',
    ref: {
      type: ctx.params.resource,
      include,
      filters
    },
  };

  ctx.body = {
    operations: [ operation ]
  };
});

app.use(router.allowedMethods());
app.use(router.routes());

app.listen(config.port, () => {
  console.log(`Started Server on Port ${config.port}`);
});
