import { Router } from 'express';
import { checkMySqlConnection } from '../server/database/connection';

const router = Router();

router.get('/database-status', async (req, res) => {
  const status = await checkMySqlConnection();
  if (status.connected) {
    res.json({
      connected: true,
      database: status.database,
    });
  } else {
    res.json({
      connected: false,
      database: status.database,
      error: status.error,
    });
  }
});

export default router;
