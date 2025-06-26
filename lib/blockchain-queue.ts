interface QueuedRequest {
  id: string
  type: 'create-match' | 'record-move'
  data: any
  resolve: (value: any) => void
  reject: (error: any) => void
  retries: number
  timestamp: number
}

class BlockchainQueue {
  private queue: QueuedRequest[] = []
  private processing = false
  private lastRequestTime = 0
  private readonly MIN_DELAY = 2000 // 2 seconds between requests
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 5000 // 5 seconds between retries

  async addRequest(type: 'create-match' | 'record-move', data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        data,
        resolve,
        reject,
        retries: 0,
        timestamp: Date.now()
      }

      this.queue.push(request)
      console.log(`🔄 Added ${type} request to queue. Queue length: ${this.queue.length}`)
      
      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    console.log(`⚡ Starting queue processing. ${this.queue.length} requests pending`)

    while (this.queue.length > 0) {
      const request = this.queue.shift()!
      
      try {
        // Ensure minimum delay between requests
        const timeSinceLastRequest = Date.now() - this.lastRequestTime
        if (timeSinceLastRequest < this.MIN_DELAY) {
          const waitTime = this.MIN_DELAY - timeSinceLastRequest
          console.log(`⏳ Waiting ${waitTime}ms before next blockchain request...`)
          await this.sleep(waitTime)
        }

        console.log(`🚀 Processing ${request.type} request (ID: ${request.id})`)
        
        const result = await this.executeRequest(request)
        this.lastRequestTime = Date.now()
        
        console.log(`✅ ${request.type} request completed successfully (ID: ${request.id})`)
        request.resolve(result)
        
      } catch (error) {
        console.error(`❌ ${request.type} request failed (ID: ${request.id}):`, error)
        
        if (request.retries < this.MAX_RETRIES) {
          request.retries++
          console.log(`🔄 Retrying ${request.type} request (attempt ${request.retries}/${this.MAX_RETRIES}) in ${this.RETRY_DELAY}ms...`)
          
          // Add back to queue with delay
          setTimeout(() => {
            this.queue.unshift(request) // Add to front of queue
            if (!this.processing) {
              this.processQueue()
            }
          }, this.RETRY_DELAY)
        } else {
          console.error(`💀 ${request.type} request failed permanently after ${this.MAX_RETRIES} retries (ID: ${request.id})`)
          request.reject(error)
        }
      }
    }

    this.processing = false
    console.log(`🏁 Queue processing completed`)
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    if (request.type === 'create-match') {
      return await this.makeHttpRequest('/api/create-match', 'POST', request.data)
    } else if (request.type === 'record-move') {
      return await this.makeHttpRequest('/api/record-move', 'POST', request.data)
    } else {
      throw new Error(`Unknown request type: ${request.type}`)
    }
  }

  private async makeHttpRequest(url: string, method: string, data: any): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success && result.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Blockchain request took too long')
      }
      
      throw error
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastRequestTime: this.lastRequestTime
    }
  }
}

// Singleton instance
export const blockchainQueue = new BlockchainQueue() 