export const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    console.log('🟡 Sending request to Firebase Function:', userMessage)

    const response = await fetch(
      'https://us-central1-real-time-chat-ffe00.cloudfunctions.net/aiChatHandler',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }),
      }
    )

    const data = await response.json()
    console.log('🟢 Firebase AI Response:', data)

    return data.aiResponse || 'No response from AI'
  } catch (error) {
    console.error('🔴 Error fetching AI response:', error)
    return 'AI is currently unavailable. Please try again later.'
  }
}
