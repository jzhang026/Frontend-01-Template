const { ParseComplexSelector } = require('./match-dom-css');

describe('parse complex css selectors', () => {
  let parseSelector = new ParseComplexSelector();

  it('can parse complex selectors', () => {
    let complexSelector = 'div.my-class[a=b][c=d]#my-id';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.class).toEqual(['my-class']);
    expect(selector.attributes).toEqual({
      c: {
        type: 'exactlyValue',
        value: 'd',
      },
      a: { type: 'exactlyValue', value: 'b' },
    });
    expect(selector.id).toEqual('my-id');
  });

  it('can parse double quoted attribute value list', () => {
    let complexSelector = 'div[role~="b c d e"]';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueList',
        value: ['b', 'c', 'd', 'e'],
      },
    });
  });

  it('can parse single quoted attribute value list', () => {
    let complexSelector = "div[role~='b c d']";
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueList',
        value: ['b', 'c', 'd'],
      },
    });
  });

  it('can parse attribute value prefix', () => {
    let complexSelector = "div[role^='b']";
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valuePrefix',
        value: 'b',
      },
    });
  });

  it('can parse attribute value suffix', () => {
    let complexSelector = 'div[role$=b]';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueSuffix',
        value: 'b',
      },
    });
  });
  it('can parse attribute value includs', () => {
    let complexSelector = 'div[role*=b]';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueIncluds',
        value: 'b',
      },
    });
  });
  it('can parse attribute value submatch', () => {
    let complexSelector = 'div[role|=B]';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueSubMatch',
        value: 'B',
      },
    });
  });

  it('can parse attribute value case sensitive flag', () => {
    let complexSelector = 'div[role|=B i]';
    let selector = parseSelector.parse(complexSelector);
    expect(selector.tag).toEqual('div');
    expect(selector.attributes).toEqual({
      role: {
        type: 'valueSubMatch',
        value: 'b',
        isCaseInsensitive: true,
      },
    });
  });
});
