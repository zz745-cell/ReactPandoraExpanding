function errorHandler(err, req, res, next) {
  try {
    const msg =
      (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err);
    process.stderr.write(`${msg}\n`);
  } catch {
    // ignore logging failures
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };


