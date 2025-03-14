import { onRequest } from 'firebase-functions/v2/https'
import OpenAI from 'openai'
import * as logger from 'firebase-functions/logger'
import { defineSecret } from 'firebase-functions/params'

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

export const aiChatHandler = onRequest(
  { secrets: [OPENAI_API_KEY] },
  async (req, res): Promise<void> => {
    logger.info('🟡 Received Request:', req.body)

    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    if (!req.body?.userMessage) {
      logger.error('🔴 Missing userMessage:', req.body)
      res.status(400).json({ error: 'Message is required' })
      return
    }

    try {
      const userMessage = req.body.userMessage

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() })

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7,
        max_tokens: 150,
      })

      const aiResponse = response.choices[0]?.message?.content || 'No response'
      logger.info('🟢 OpenAI Response:', aiResponse)

      res.status(200).json({ aiResponse })
      return
    } catch (error) {
      logger.error('🔴 OpenAI API Error:', error)
      res.status(500).json({ error: 'AI service unavailable' })
      return
    }
  }
)
