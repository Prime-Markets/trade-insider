'use client'

import { cn } from '@/lib/utils'
import { ChatRequestOptions, JSONValue, Message } from 'ai'
import { useEffect, useMemo, useState } from 'react'
import { RenderMessage } from './render-message'
import { ToolSection } from './tool-section'
import { Spinner } from './ui/spinner'

// Import section structure interface
interface ChatSection {
  id: string
  userMessage: Message
  assistantMessages: Message[]
}

interface ChatMessagesProps {
  sections: ChatSection[] // Changed from messages to sections
  data: JSONValue[] | undefined
  onQuerySelect: (query: string) => void
  isLoading: boolean
  chatId?: string
  addToolResult?: (params: { toolCallId: string; result: any }) => void
  /** Ref for the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
  onUpdateMessage?: (messageId: string, newContent: string) => Promise<void>
  reload?: (
    messageId: string,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>
}

export function ChatMessages({
  sections,
  data,
  onQuerySelect,
  isLoading,
  chatId,
  addToolResult,
  scrollContainerRef,
  onUpdateMessage,
  reload
}: ChatMessagesProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [showExtendedLoading, setShowExtendedLoading] = useState(false)
  const manualToolCallId = 'manual-tool-call'

  // Track when loading starts to show extended loading for widgets
  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now())
      setShowExtendedLoading(true)
    } else if (!isLoading) {
      // Keep loading visible for at least 2 seconds to allow widgets to load
      if (loadingStartTime) {
        const elapsed = Date.now() - loadingStartTime
        const minLoadingTime = 2000 // 2 seconds minimum
        
        if (elapsed < minLoadingTime) {
          setTimeout(() => {
            setShowExtendedLoading(false)
            setLoadingStartTime(null)
          }, minLoadingTime - elapsed)
        } else {
          setShowExtendedLoading(false)
          setLoadingStartTime(null)
        }
      }
    }
  }, [isLoading, loadingStartTime])

  useEffect(() => {
    if (sections.length > 0) {
      const lastSection = sections[sections.length - 1]
      if (lastSection.userMessage.role === 'user') {
        setOpenStates({ [manualToolCallId]: true })
      }
    }
  }, [sections])

  const lastToolData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null

    const lastItem = data[data.length - 1] as {
      type: 'tool_call'
      data: {
        toolCallId: string
        state: 'call' | 'result'
        toolName: string
        args: string
      }
    }

    if (lastItem.type !== 'tool_call') return null

    const toolData = lastItem.data
    return {
      state: 'call' as const,
      toolCallId: toolData.toolCallId,
      toolName: toolData.toolName,
      args: toolData.args ? JSON.parse(toolData.args) : undefined
    }
  }, [data])

  if (!sections.length) return null
  
  const allMessages = sections.flatMap(section => [
    section.userMessage,
    ...section.assistantMessages
  ])

  const lastUserIndex =
    allMessages.length -
    1 -
    [...allMessages].reverse().findIndex(msg => msg.role === 'user')

  // Show loading if actively loading OR during extended loading period
  const showLoading = (isLoading || showExtendedLoading) &&
    sections.length > 0 &&
    sections[sections.length - 1].assistantMessages.length === 0

  // Show spinner between messages during streaming
  const showStreamingSpinner = isLoading && 
    sections.length > 0 && 
    sections[sections.length - 1].assistantMessages.length > 0

  const getIsOpen = (id: string) => {
    if (id.includes('call')) {
      return openStates[id] ?? true
    }
    const baseId = id.endsWith('-related') ? id.slice(0, -8) : id
    const index = allMessages.findIndex(msg => msg.id === baseId)
    return openStates[id] ?? index >= lastUserIndex
  }

  const handleOpenChange = (id: string, open: boolean) => {
    setOpenStates(prev => ({
      ...prev,
      [id]: open
    }))
  }

  const isMessageComplete = (message: Message, sectionIndex: number, messageIndex: number) => {
    if (!isLoading) return true
    
    if (sectionIndex < sections.length - 1) return true
    
    const lastSection = sections[sections.length - 1]
    if (messageIndex < lastSection.assistantMessages.length - 1) return true
    
    return false
  }

  return (
    <div
      id="scroll-container"
      ref={scrollContainerRef}
      role="list"
      aria-roledescription="chat messages"
      className={cn(
        'relative size-full pt-14',
        sections.length > 0 ? 'flex-1 overflow-y-auto' : ''
      )}
    >
      <div className="relative mx-auto w-full max-w-3xl px-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="chat-section mb-8"
            style={
              sectionIndex === sections.length - 1
                ? { minHeight: 'calc(-228px + 100dvh)' }
                : {}
            }
          >
            <div className="flex flex-col gap-4 mb-4">
              <RenderMessage
                message={section.userMessage}
                messageId={section.userMessage.id}
                getIsOpen={getIsOpen}
                onOpenChange={handleOpenChange}
                onQuerySelect={onQuerySelect}
                chatId={chatId}
                addToolResult={addToolResult}
                onUpdateMessage={onUpdateMessage}
                reload={reload}
                isComplete={true}
                userQuery={typeof section.userMessage.content === 'string' ? section.userMessage.content : ''}
              />
              {showLoading && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Spinner />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading charts and market data...
                  </p>
                </div>
              )}
            </div>

            {section.assistantMessages.map((assistantMessage, messageIndex) => (
              <div key={assistantMessage.id} className="flex flex-col gap-4">
                <RenderMessage
                  message={assistantMessage}
                  messageId={assistantMessage.id}
                  getIsOpen={getIsOpen}
                  onOpenChange={handleOpenChange}
                  onQuerySelect={onQuerySelect}
                  chatId={chatId}
                  addToolResult={addToolResult}
                  onUpdateMessage={onUpdateMessage}
                  reload={reload}
                  isComplete={isMessageComplete(assistantMessage, sectionIndex, messageIndex)}
                  userQuery={typeof section.userMessage.content === 'string' ? section.userMessage.content : ''}
                />
                {/* Show streaming spinner between assistant messages */}
                {showStreamingSpinner && messageIndex === section.assistantMessages.length - 1 && (
                  <div className="flex justify-center py-2">
                    <Spinner/>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {showLoading && lastToolData && (
          <ToolSection
            key={manualToolCallId}
            tool={lastToolData}
            isOpen={getIsOpen(manualToolCallId)}
            onOpenChange={open => handleOpenChange(manualToolCallId, open)}
            addToolResult={addToolResult}
          />
        )}
      </div>
    </div>
  )
}