import app from './app.js';
import { config } from './config/env.js';
import { checkSupabaseConnection } from './config/supabase.js';

const startServer = () => {
  const server = app.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
    console.log(`Health endpoint: http://localhost:${config.port}/api/v1/health`);

    // Verify and log database connection status
    checkSupabaseConnection();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Please free the port or choose another.`);
    } else {
      console.error('Server failed to start:', err.message);
    }
    process.exit(1);
  });

  return server;
};

startServer();