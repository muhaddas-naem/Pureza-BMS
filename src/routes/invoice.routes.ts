import { Router } from 'express';
import { invoiceService } from '../services/invoice.service';

const router = Router();

router.post('/download', (req, res, next) => {
  try {
    const { base64Data, fileName, contentType } = req.body;
    const result = invoiceService.storeInvoice(base64Data, fileName, contentType);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/file/:fileId/:fileName', (req, res, next) => {
  try {
    const { fileId } = req.params;
    const item = invoiceService.getInvoice(fileId);

    if (!item) {
      return res.status(404).send('File expired or not found');
    }

    res.setHeader('Content-Type', item.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${item.fileName}"; filename*=UTF-8''${encodeURIComponent(item.fileName)}`);
    res.setHeader('Content-Length', item.buffer.length.toString());
    return res.send(item.buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
