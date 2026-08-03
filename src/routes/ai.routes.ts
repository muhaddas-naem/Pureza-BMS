import { Router } from 'express';
import { generateAssistantReply, parseOrderTextFromAi } from '../services/ai.service';

const router = Router();

router.post('/assistant', async (req, res, next) => {
  try {
    const { prompt, context, systemContext } = req.body;
    const replyText = await generateAssistantReply(prompt, context, systemContext);
    return res.json({ text: replyText, reply: replyText });
  } catch (error) {
    next(error);
  }
});

router.post('/parse-order', async (req, res, next) => {
  try {
    const { rawText, availableProducts } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'টেক্সট ইনপুট ফাঁকা হতে পারে না।' });
    }

    const parsedData = await parseOrderTextFromAi(rawText, availableProducts);
    return res.json({ success: true, data: parsedData });
  } catch (error) {
    next(error);
  }
});

export default router;
