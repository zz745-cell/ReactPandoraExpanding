function createMockReqResNext({ body = {}, headers = {} } = {}) {
  const req = { body, headers };

  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.sendStatus = jest.fn(() => res);

  const next = jest.fn();

  return { req, res, next };
}

module.exports = { createMockReqResNext };


