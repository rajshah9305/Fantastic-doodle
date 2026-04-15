import { useState, useEffect } from 'react'
import ApiKeyModal from './components/ApiKeyModal'
import Header from './components/Header'
import ExecutionPane from './components/ExecutionPane'
import OutputPane from './components/OutputPane'
import ChatInput from './components/ChatInput'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')
  const [logs, setLogs] = useState([])
  const [executionHistory, setExecutionHistory] = useState([])

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${apiUrl}/api/models`)
        const data = await response.json()
        setModels(data.models)
      } catch (err) {
        console.error('Failed to fetch models:', err)
      }
    }
    fetchModels()
  }, [])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    })
    setLogs(prev => [...prev, { timestamp, message, type, id: Date.now() + Math.random() }])
  }

  const handleApiKeySubmit = (key) => {
    setApiKey(key)
    setShowApiKeyModal(false)
  }

  const handleProcess = async (text, options = {}) => {
    setLoading(true)
    setError(null)
    setLogs([])

    const executionId = Date.now()
    const execution = {
      id: executionId,
      input: text,
      timestamp: new Date().toISOString(),
      status: 'running'
    }
    setExecutionHistory(prev => [execution, ...prev])

    try {
      addLog('🚀 Initializing request...', 'info')
      addLog(`📊 Model: ${selectedModel}`, 'info')
      addLog('🔍 Analyzing intent...', 'agent')

      const apiUrl = import.meta.env.VITE_API_URL || ''
      
      addLog('📡 Sending to backend...', 'info')
      
      const response = await fetch(`${apiUrl}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          api_key: apiKey,
          model: selectedModel,
          options: {
            enable_search: options.enableSearch,
            enable_code: options.enableCode,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        addLog(`❌ Error: ${errorData.error}`, 'error')
        throw new Error(errorData.error || 'Processing failed')
      }

      addLog('🤖 Processing with AI...', 'agent')
      const data = await response.json()
      
      addLog(`✅ Intent: ${data.intent}`, 'success')
      addLog(`📈 Tokens: ${data.tokens_used}`, 'info')
      addLog(`⏱️  Time: ${data.processing_time}s`, 'info')
      addLog('✓ Completed successfully!', 'success')
      
      setResult(data)
      setExecutionHistory(prev => 
        prev.map(ex => ex.id === executionId 
          ? { ...ex, status: 'completed', result: data }
          : ex
        )
      )
    } catch (err) {
      addLog(`❌ Failed: ${err.message}`, 'error')
      setError(err.message)
      setExecutionHistory(prev => 
        prev.map(ex => ex.id === executionId 
          ? { ...ex, status: 'failed', error: err.message }
          : ex
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col overflow-hidden">
      {showApiKeyModal && (
        <ApiKeyModal onSubmit={handleApiKeySubmit} />
      )}
      
      <Header 
        onChangeApiKey={() => setShowApiKeyModal(true)} 
      />
      
      {/* Two-Pane Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0 overflow-hidden">
        {/* Left Pane: Live Executions */}
        <div className="lg:w-1/2 flex flex-col min-h-0 h-full">
          <ExecutionPane 
            logs={logs}
            isProcessing={loading}
            executionHistory={executionHistory}
          />
        </div>

        {/* Right Pane: Generated Output */}
        <div className="lg:w-1/2 flex flex-col min-h-0 h-full">
          <OutputPane 
            result={result}
            error={error}
            loading={loading}
          />
        </div>
      </main>

      {/* Bottom Chat Input */}
      <ChatInput 
        onSubmit={handleProcess}
        loading={loading}
        disabled={!apiKey}
        models={models}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  )
}

export default App
