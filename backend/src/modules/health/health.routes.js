import { Router } from 'express';
import { isSupabaseConfigured } from '../../config/supabase.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isSupabaseConfigured() ? 'supabase-configured' : 'supabase-pending-credentials',
  });
});

export default router;