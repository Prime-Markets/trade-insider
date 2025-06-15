'use client'
import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { ArrowUp, ChevronDown, MessageCirclePlus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { useArtifact } from './artifact/artifact-context'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'

// Search tracker hook
function useSearchTracker() {
  const [searchCount, setSearchCount] = useState(0)
  const [isTrialExpired, setIsTrialExpired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get current search count from localStorage (client-side tracking)
    const count = parseInt(localStorage.getItem('free_searches') || '0')
    setSearchCount(count)
    setIsTrialExpired(count >= 10)
  }, [])

  const trackSearch = async () => {
    const newCount = searchCount + 1
    
    if (newCount > 10) {
      // Redirect to login if exceeded free searches
      router.push('/auth/login')
      return false
    }

    // Update both client and server tracking
    localStorage.setItem('free_searches', newCount.toString())
    
    // Make a request to update server-side cookie
    try {
      await fetch('/api/track-search', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Failed to track search on server:', error)
    }

    setSearchCount(newCount)
    
    if (newCount >= 10) {
      setIsTrialExpired(true)
    }

    return true
  }

  const getRemainingSearches = () => Math.max(0, 10 - searchCount)

  return {
    searchCount,
    isTrialExpired,
    trackSearch,
    remainingSearches: getRemainingSearches()
  }
}

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether to show the scroll to bottom button */
  showScrollToBottomButton: boolean
  /** Reference to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
  /** User object - null if not authenticated */
  user?: any
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  showScrollToBottomButton,
  scrollContainerRef,
  user
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { close: closeArtifact } = useArtifact()
  const { searchCount, isTrialExpired, trackSearch, remainingSearches } = useSearchTracker()

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false
    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]
    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  // Enhanced submit handler with search tracking
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // If user is not authenticated, track the search
    if (!user) {
      const canSearch = await trackSearch()
      if (!canSearch) {
        return // Will redirect to login
      }
    }

    // Call the original submit handler
    handleSubmit(e)
  }

  // Enhanced append function with search tracking
  const handleAppend = async (message: any) => {
    // If user is not authenticated, track the search
    if (!user) {
      const canSearch = await trackSearch()
      if (!canSearch) {
        return // Will redirect to login
      }
    }

    // Call the original append function
    append(message)
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      handleAppend({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Scroll to the bottom of the container
  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Check if input should be disabled
  const isInputDisabled = isLoading || isToolInvocationInProgress() || (!user && isTrialExpired)

  return (
    <div
      className={cn(
        'w-full bg-background group/form-container shrink-0',
        messages.length > 0 ? 'sticky bottom-0 px-2 pb-4' : 'px-6'
      )}
    >
      {messages.length === 0 && (
        <div className="mb-10 flex flex-col items-center gap-4">
          {/* <IconLogo className="size-12 text-muted-foreground" /> */}
          <p className="text-center text-3xl font-semibold">
            TRADE INSIDER
          </p>
        </div>
      )}

      {/* Trial status indicator for unauthenticated users */}
      {!user && (
        <div className="mb-4 text-center">
          {remainingSearches > 0 ? (
            <p className="text-sm text-muted-foreground">
              You have {remainingSearches} free search{remainingSearches !== 1 ? 'es' : ''} remaining
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-yellow-600">
                No more free searches. Please sign in to continue searching.
              </p>
              <Button 
                onClick={() => router.push('/auth/login')}
                size="sm"
                variant="outline"
              >
                Sign in to continue
              </Button>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className={cn('max-w-3xl w-full mx-auto relative')}
      >
        {/* Scroll to bottom button - only shown when showScrollToBottomButton is true */}
        {showScrollToBottomButton && messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -top-10 right-4 z-20 size-8 rounded-full shadow-md"
            onClick={handleScrollToBottom}
            title="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </Button>
        )}
        <div className={cn(
          "relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input",
          !user && isTrialExpired && "opacity-50"
        )}>
          <Textarea
            ref={inputRef}
            name="input"
            rows={2}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={
              !user && isTrialExpired 
                ? "Sign in to continue asking questions..." 
                : "Ask a question or add currency pair, stock, or crypto to get started..."
            }
            spellCheck={false}
            value={input}
            disabled={isInputDisabled}
            className="resize-none w-full min-h-12 bg-transparent border-0 p-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            onChange={e => {
              handleInputChange(e)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          {/* Bottom menu area */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {/* <ModelSelector models={models || []} /> */}
              {/* <SearchModeToggle /> */}
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewChat}
                  className="shrink-0 rounded-full group"
                  type="button"
                  disabled={isInputDisabled}
                >
                  <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
                </Button>
              )}
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={'icon'}
                variant={'outline'}
                className={cn(isLoading && 'animate-pulse', 'rounded-full')}
                disabled={
                  (input.length === 0 && !isLoading) ||
                  isInputDisabled
                }
                onClick={isLoading ? stop : undefined}
              >
                {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
              </Button>
            </div>
          </div>
        </div>
        {messages.length === 0 && (
          <EmptyScreen
            submitMessage={message => {
              handleInputChange({
                target: { value: message }
              } as React.ChangeEvent<HTMLTextAreaElement>)
            }}
            className={cn(showEmptyScreen ? 'visible' : 'invisible')}
          />
        )}
      </form>
    </div>
  )
}