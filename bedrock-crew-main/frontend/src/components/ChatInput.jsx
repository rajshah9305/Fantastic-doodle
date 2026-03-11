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
    <div className="border-t-2 border-white/30 glass-effect shadow-2xl relative z-20">
      <div className="px-6 py-5">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your task in natural language... (Shift+Enter for new line)"
                className="relative w-full bg-white/90 backdrop-blur-sm text-gray-900 rounded-2xl border-2 border-gray-200 px-6 py-4 pr-48 focus:border-orange-500 focus:ring-4 focus:ring-orange-200/50 outline-none resize-none font-medium shadow-lg hover:shadow-xl transition-all duration-300 placeholder:text-gray-400"
                rows="3"
                disabled={disabled || loading}
              />
              
              {/* Model Selector */}
              {models.length > 0 && (
                <div className="absolute right-4 top-4">
                  <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="bg-gradient-to-r from-orange-50 to-white text-gray-900 text-xs font-bold rounded-xl border-2 border-orange-200 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
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
              className="inline-flex items-center px-10 py-5 text-base font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95 animate-gradient bg-[length:200%_auto] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Execute
                </>
              )}
            </button>
          </div>
          
          {/* Options below input box */}
          <div className="flex items-center space-x-8 px-2">
            <label className="inline-flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded-md focus:ring-orange-500 focus:ring-2 transition-all duration-300 cursor-pointer"
                  disabled={loading}
                />
                {enableSearch && (
                  <div className="absolute -inset-1 bg-orange-400 rounded-md blur opacity-50 animate-pulse"></div>
                )}
              </div>
              <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors duration-300 flex items-center">
                <span className="text-base mr-1 group-hover:scale-125 transition-transform">🔍</span> Enable Search
              </span>
            </label>
            <label className="inline-flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableCode}
                  onChange={(e) => setEnableCode(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded-md focus:ring-orange-500 focus:ring-2 transition-all duration-300 cursor-pointer"
                  disabled={loading}
                />
                {enableCode && (
                  <div className="absolute -inset-1 bg-orange-400 rounded-md blur opacity-50 animate-pulse"></div>
                )}
              </div>
              <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors duration-300 flex items-center">
                <span className="text-base mr-1 group-hover:scale-125 transition-transform">💻</span> Enable Code
              </span>
            </label>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
