import { Printer } from 'lucide-react'
import { Button } from './ui/button'

interface PrintButtonProps {
  chatId: string
  className?: string
}

export function PrintButton({ chatId, className }: PrintButtonProps) {
  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          body * { visibility: hidden; }
          #scroll-container, #scroll-container * { visibility: visible; }
          #scroll-container { 
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 20px !important;
          }
          .chat-section { 
            page-break-inside: avoid;
            margin-bottom: 30px !important;
          }
          /* Hide interactive elements */
          button, .tool-section button { display: none !important; }
          /* Ensure text is black */
          * { color: black !important; }
          /* Add page breaks for long conversations */
          .chat-section:nth-child(5n) { page-break-after: always; }
        }
      </style>
    `
    
    // Temporarily add print styles
    const styleElement = document.createElement('div')
    styleElement.innerHTML = printStyles
    document.head.appendChild(styleElement.firstElementChild!)
    
    // Trigger print
    window.print()
    
    // Clean up styles after print dialog closes
    setTimeout(() => {
      const addedStyle = document.head.querySelector('style:last-child')
      if (addedStyle) {
        document.head.removeChild(addedStyle)
      }
    }, 1000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={className}
      title="Print conversation"
    >
      <Printer className="h-4 w-4" />
      Print
    </Button>
  )
}