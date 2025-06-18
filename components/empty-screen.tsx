import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Top JSE stocks to watch',
    message: 'What are the top-performing JSE stocks to watch in 2025?'
  },
  {
    heading: 'South African Rand outlook',
    message: 'What is the outlook for the South African Rand (ZAR) in 2025?'
  },
  {
    heading: 'Sasol stock analysis',
    message: 'Is now a good time to invest in Sasol stock?'
  },
  {
    heading: 'Best dividend stocks on JSE',
    message: 'Which JSE-listed stocks offer the best dividends in 2025?'
  },
  {
    heading: 'JSE market trends',
    message: 'What are the major trends shaping the JSE this year?'
  },
  {
    heading: 'Naspers vs Prosus',
    message: 'How do Naspers and Prosus compare as investments?'
  },
  {
    heading: 'Mining stocks outlook',
    message: 'What is the outlook for mining stocks on the JSE?'
  },
  {
    heading: 'JSE earnings preview',
    message: 'Which major JSE companies are reporting earnings this week?'
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
