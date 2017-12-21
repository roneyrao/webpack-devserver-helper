import { expect } from 'chai';

import parseProxies from './proxy';

describe('parseProxies', () => {
  const publicPath = 'root';
  const apiPrefix = 'api';
  const log = {
    logLevel: 'debug',
  };
  it('string', () => {
    const url = 'http://abc.efc';
    const name = `${publicPath}/${apiPrefix}`;
    expect(parseProxies(url, publicPath, apiPrefix)).to.eql({
      [name]: Object.assign({ target: url, pathRewrite: { [`^${name}`]: '' } }, log),
    });
  });
  it("{'api':'http://afsfa.com'}", () => {
    const name = 'api/';
    const proxies = { [name]: 'http://afsfa.com' };
    const newName = `${publicPath}/api`; // trailing slash is removed
    const result = parseProxies(proxies, publicPath, apiPrefix);
    expect(result).to.eql({
      [newName]: Object.assign(
        { target: proxies[name], pathRewrite: { [`^${newName}`]: '' } },
        log,
      ),
    });
  });
  it("{'api':{target:'http://afsfa.com', pathRewrite:{abc:1}}} - pathRewrite is untouched", () => {
    const name = 'api/';
    const proxies = {
      [name]: {
        target: 'http://afsfa.com',
        pathRewrite: { abc: 1 },
      },
    };
    const newName = `${publicPath}/api`; // trailing slash is removed
    const result = parseProxies(proxies, publicPath, apiPrefix);
    expect(result).to.eql({
      [newName]: Object.assign(proxies[name], log),
    });
  });

  function calcContext(context) {
    return context.map(name => `${publicPath}${name.endsWith('/') ? name.substr(0, name.length - 1) : name}`);
  }

  it("{context: ['/auth/', '/api'],target: 'http://localhost:3000'}", () => {
    const proxies = { context: ['/auth/', '/api'], target: 'http://localhost:3000' };
    const newContext = calcContext(proxies.context);
    const pathRewrite = {};
    newContext.forEach((name) => {
      pathRewrite[`^${name}`] = '';
    });
    const result = parseProxies(proxies, publicPath, apiPrefix);
    expect(result).to.eql([
      Object.assign({ context: newContext, target: proxies.target, pathRewrite }, log),
    ]);
  });
  it("{context: ['/auth/', '/api'],target: 'http://localhost:3000', pathRewrite:{abc:1}}} - pathRewrite is untouched", () => {
    const proxies = {
      context: ['/auth/', '/api'],
      target: 'http://localhost:3000',
      pathRewrite: { abc: 1 },
    };
    const newContext = calcContext(proxies.context);
    const result = parseProxies(proxies, publicPath, apiPrefix);
    expect(result).to.eql([Object.assign(proxies, { context: newContext }, log)]);
  });
  it('complex array', () => {
    const proxies = [
      { context: ['/auth/', '/api'], target: 'http://localhost:3000', pathRewrite: { abc: 1 } },
      { context: ['/auth2', '/api2/'], target: 'http://localhost:8000' },
    ];
    const result = parseProxies(proxies, publicPath, apiPrefix);
    expect(result).to.eql(proxies.map((item) => {
    const newContext = calcContext(proxies.context);
      return Object.assign(item, { context: newContext }, log);
    }));
  });
});
