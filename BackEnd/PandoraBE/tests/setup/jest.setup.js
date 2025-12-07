beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  if (console.log.mockRestore) {
    console.log.mockRestore();
  }
});


