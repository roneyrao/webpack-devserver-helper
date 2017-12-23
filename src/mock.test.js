import { expect } from 'chai';

import { staticMock, parseMockConfig } from './mock';

describe('parseMockConfig', () => {
  it("true => {folder:'mock'}", () => {
    expect(parseMockConfig(true)).to.eql({ folder: 'mock' });
  });
  it("'mockDir' => {folder:'mockDir'}", () => {
    expect(parseMockConfig('mockDir')).to.eql({ folder: 'mockDir' });
  });
  it("[['path', 'path.json']] => {folder:'mock', rewrites:[['path', 'path.json']]}", () => {
    expect(parseMockConfig([['path', 'path.json']])).to.eql({ folder: 'mock', rewrites: [['path', 'path.json']] });
  });
  it("{rewrites:[['path', 'path.json']]} => {folder:'mock', rewrites:[['path', 'path.json']]}", () => {
    expect(parseMockConfig({ rewrites: [['path', 'path.json']] })).to.eql({ folder: 'mock', rewrites: [['path', 'path.json']] });
  });
  it("{folder:'mockDir', rewrites:[['path', 'path.json']]} stay untouched", () => {
    const data = { folder: 'mockDir', rewrites: ['path', 'path.json'] };
    expect(parseMockConfig(data)).to.equal(data);
  });
});


describe('staticMock', () => {
  it('no rewrites and extension specified, path => mockDir/path.json', () => {
    const mock = staticMock({ folder: 'mockData' });
    const path = 'abc.efd';
    expect(mock(path)).to.eql(`mockData/${path}.json`);
  });
  it('no rewrites with public path and extension specified', () => {
    const mock = staticMock({ folder: 'mockData' }, 'root', 'txt');
    const path = 'abc.efd';
    expect(mock(path)).to.eql(`root/mockData/${path}.txt`);
  });
  it('rewrites correctly', () => {
    const mock = staticMock({ folder: 'mockData', rewrites: [['article/(\\d+)/comment/(\\d+)', 'article_$2_comment_$1.json']] });
    expect(mock('article/235/comment/456')).to.eql('mockData/article_456_comment_235.json');
  });
});

