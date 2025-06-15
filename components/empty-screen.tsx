import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'What are the top AI stocks to watch?',
    message: 'What are the top AI stocks to watch in 2025?'
  },
  {
    heading: 'USD/EUR forex outlook',
    message: 'What\'s the current USD/EUR exchange rate and outlook?'
  },
  {
    heading: 'Bitcoin vs Ethereum analysis',
    message: 'Compare Bitcoin vs Ethereum as investments right now'
  },
  {
    heading: 'Best dividend stocks 2025',
    message: 'What are the best dividend-paying stocks for 2025?'
  },
  {
    heading: 'Crypto market trends',
    message: 'What are the major cryptocurrency trends to watch?'
  },
  {
    heading: 'Tesla stock analysis',
    message: 'Should I buy Tesla stock at current prices?'
  },
  {
    heading: 'Japanese Yen strength',
    message: 'Why is the Japanese Yen strengthening against the dollar?'
  },
  {
    heading: 'Tech stock earnings preview',
    message: 'Which tech companies have earnings this week?'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
