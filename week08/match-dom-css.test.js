const { getComplexSelectorParser } = require('./parseComplexSelector');

describe('parse complex css selectors', () => {
  let parseSelector = getComplexSelectorParser();

  it('can parse complex selectors', () => {
    let complexSelector = 'div.my-class[a=b][c=d]#my-id';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.class).toEqual(['my-class']);
    expect(selector.attributes).toEqual({ c: 'd', a: 'b' });
    expect(selector.id).toEqual('my-id');
  });
});
