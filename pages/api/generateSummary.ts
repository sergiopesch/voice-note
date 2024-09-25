// pages/api/generateSummary.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transcriptionText } = req.body

  if (!transcriptionText) {
    return res.status(400).json({ error: 'No transcription text provided.' })
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = `Please provide a short and precise title (max 8 words), a concise summary, and next steps if you find any for the following transcription:

"${transcriptionText}"

Title:
`

  const maxRetries = 5
  let retryCount = 0
  let delay = 1000 // Start with 1 second

  while (retryCount < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      })

      const result = response.choices[0].message?.content || ''
      const [titleText, rest] = result.split('Summary:')
      const [summaryText, nextStepsText] = rest.split('Next Steps:')

      return res.status(200).json({
        title: titleText.trim(),
        summary: summaryText.trim(),
        nextSteps: nextStepsText ? nextStepsText.trim() : '',
      })
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limit exceeded, implement exponential backoff
        retryCount++
        console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      } else {
        console.error('Error fetching summary:', error)
        return res.status(500).json({ error: 'Error fetching summary.' })
      }
    }
  }

  // If all retries fail
  return res.status(429).json({
    error:
      'Rate limit exceeded. Please try again later or check your OpenAI account quota.',
  })
}
