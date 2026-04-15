import { useState } from 'react'

function ChatInput({ onSubmit, loading, disabled, models, selectedModel, onModelChange }) {
  const [input, setInput] = useState('')
  const [enableSearch, setEnableSearch] = useState(false)
  const [enableCode, setEnableCode] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      onSubmit(input, { enableSearch, enableCode })
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-lg shadow-2xl">
      <div className="px-6 py-4">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your task in natural language... (Shift+Enter for new line)"
                className="w-full bg-white text-gray-900 rounded-xl border border-gray-300 px-5 py-4 pr-48 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none font-medium shadow-sm hover:shadow-md transition-shadow"
                rows="3"
                disabled={disabled || loading}
              />
              
              {/* Model Selector */}
              {models.length > 0 && (
                <div className="absolute right-3 top-3">
                  <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="bg-white text-gray-900 text-xs font-semibold rounded-lg border border-gray-300 px-3 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm hover:shadow-md transition-shadow"
                    disabled={loading}
                    aria-label="Select AI model"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={disabled || loading || !input.trim()}
              className="inline-flex items-center px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Execute
                </>
              )}
            </button>
          </div>
          
          {/* Options below input box */}
          <div className="flex items-center space-x-6 px-2">
            <label className="inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                disabled={loading}
              />
              <span className="ml-2 text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">🔍 Enable Search</span>
            </label>
            <label className="inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={enableCode}
                onChange={(e) => setEnableCode(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                disabled={loading}
              />
              <span className="ml-2 text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">💻 Enable Code</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
