import { Router } from 'express';
import { generateSqlSchema } from '../utils/sqlExporter.util';

const router = Router();

router.get('/export-sql', (req, res) => {
  const sqlSchema = generateSqlSchema();
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename=pbms_database.sql');
  res.send(sqlSchema);
});

export default router;
