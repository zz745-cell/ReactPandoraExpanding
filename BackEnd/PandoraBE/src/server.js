const { app } = require('./app');
const { config } = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('auth mode:', config.authMode);
  console.log('FIREBASE_SERVICE_ACCOUNT_JSON:', config);

  
  // Keep a clear startup signal without using console.*
  process.stdout.write(`PandoraBE server listening on port ${PORT}\n`);
});

// Surface listen errors (e.g. EADDRINUSE) without console.*
server.on('error', (err) => {
  try {
    const msg =
      err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
    process.stderr.write(`${msg}\n`);
  } catch {
    // ignore logging failures
  }
  process.exitCode = 1;
});


