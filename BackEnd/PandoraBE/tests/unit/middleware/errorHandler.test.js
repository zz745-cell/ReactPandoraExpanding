const { errorHandler } = require('../../../src/middleware/errorHandler');

describe('errorHandler middleware', () => {
  test('uses err.status and err.message when provided', () => {
    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    const next = jest.fn();

    const error = new Error('Bad request');
    error.status = 400;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad request' });
    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('defaults to 500 and generic message when status/message missing', () => {
    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    const next = jest.fn();

    const error = {};

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});


