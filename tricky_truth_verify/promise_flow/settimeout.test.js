describe('tete', () => {
  it('settimeout', () => {
    let fn = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(3), 1500))
    );

    return fn().then((res) => {
      expect(res).toEqual(3);
    });
  });
});
