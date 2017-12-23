import { expect } from 'chai';

import { parseMockConfig, staticMock, parseProxies } from './index';

describe('exported correctly', () => {
  it('parseMockConfig is function', () => {
    expect(typeof parseMockConfig).to.equal('function');
  });
  it('staticMock is function', () => {
    expect(typeof staticMock).to.equal('function');
  });
  it('parseProxies is function', () => {
    expect(typeof parseProxies).to.equal('function');
  });
});
