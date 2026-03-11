import { useState } from 'react'

function ApiKeyModal({ onSubmit }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!key.trim()) {
      setError('API key is required')
      return
    }
    
    if (!key.startsWith('gsk_')) {
      setError('Invalid Groq API key format (should start with gsk_)')
      return
    }
    
    onSubmit(key)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="glass-effect border-2 border-white/30 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* Header */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl animate-pulse"></div>
            <div className="relative bg-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black gradient-text mb-2">Enter Your API Key</h2>
          <p className="text-sm font-semibold text-gray-600">Connect to Groq to start processing</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="api-key" className="block text-sm font-black text-gray-900 mb-3">
              Groq API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setError('')
                }}
                placeholder="gsk_..."
                className={`w-full bg-white/90 backdrop-blur-sm border-2 text-gray-900 font-semibold rounded-xl px-5 py-4 pr-12 outline-none transition-all duration-300 shadow-lg hover:shadow-xl ${
                  error 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200'
                }`}
                autoFocus
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'api-key-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors duration-300"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p id="api-key-error" className="mt-3 text-sm font-bold text-red-600 flex items-center" role="alert">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-gradient bg-[length:200%_auto]"
          >
            Continue
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApiKeyModal
