const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve(__dirname, '../../logs');
const authLogPath = path.join(logDirectory, 'auth.log');

// Auth diagnostics must be useful without leaking credentials. Do not add
// passwords, JWTs, Supabase access tokens, cookies, or connection strings.
const logAuthEvent = (event, details = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };

  try {
    fs.mkdirSync(logDirectory, { recursive: true });
    fs.appendFileSync(authLogPath, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch (error) {
    // Logging must never prevent an authentication response.
    console.error('Unable to write authentication log:', error.message);
  }
};

module.exports = { logAuthEvent, authLogPath };
