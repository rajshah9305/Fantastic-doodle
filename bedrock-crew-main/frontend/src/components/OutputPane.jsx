import { useState } from 'react'

function OutputPane({ result, error, loading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isCodeOutput = (text) => {
    if (!text) return false
    const codeIndicators = [
      /```/,
      /<!DOCTYPE/i,
      /<html/i,
      /<head>/i,
      /<body>/i,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /def\s+\w+\s*\(/,
      /public\s+class/,
      /private\s+\w+/,
      /<\w+[^>]*>/,
      /\{[\s\S]*\}/
    ]
    return codeIndicators.some(pattern => pattern.test(text))
  }

  const renderOutput = () => {
    if (!result) return null

    const isCode = isCodeOutput(result.result)

    if (isCode) {
      return (
        <div className="bg-black rounded-2xl border-2 border-gray-800 overflow-hidden shadow-2xl">
          <div className="px-5 py-3 bg-gray-900 border-b-2 border-gray-800 flex items-center justify-between">
            <span className="text-sm font-black text-orange-500 flex items-center">
              <span className="mr-2">💻</span> Code Output
            </span>
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <pre className="p-6 text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-mono">
            {result.result}
          </pre>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <div className="text-base text-black font-medium leading-relaxed whitespace-pre-wrap break-words">
          {result.result}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full glass-effect rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl transform transition-all duration-500">
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-black text-black">Generated Output</h2>
          </div>
          {result && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/50 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-full fade-in">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6">
                <div className="absolute inset-0 bg-orange-500 rounded-full animate-spin opacity-75"></div>
                <div className="absolute inset-0 bg-orange-600 rounded-full animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="relative bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10 text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-black text-black mb-2 gradient-text animate-gradient bg-[length:200%_auto]">Generating output...</p>
              <p className="text-base text-gray-600 font-semibold mb-4">AI is processing your request</p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-black text-red-900 mb-2">Error Occurred</h3>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="flex items-center justify-center h-full fade-in">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6 float-animation">
                <div className="absolute inset-0 bg-orange-500/10 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="absolute inset-0 bg-orange-500/20 rounded-3xl animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="relative bg-white rounded-3xl w-24 h-24 flex items-center justify-center shadow-2xl border-2 border-gray-200">
                  <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-black text-black mb-3">Ready to Generate</h3>
              <p className="text-base font-semibold text-gray-600 mb-6">Enter your task below to see the magic happen</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI Ready</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Models Loaded</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-5 scale-in">
            {/* Intent Badge */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-4 py-2 text-sm font-black text-white bg-orange-500 rounded-full shadow-md hover:scale-110 transition-transform duration-300 cursor-default">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                {result.intent}
              </span>
              {isCodeOutput(result.result) && (
                <span className="inline-flex items-center px-4 py-2 text-sm font-black text-white bg-black rounded-full shadow-md hover:scale-110 transition-transform duration-300 cursor-default">
                  💻 Code
                </span>
              )}
            </div>

            {/* Output */}
            {renderOutput()}

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
                <div className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wide flex items-center">
                  <span className="text-lg mr-1 group-hover:scale-125 transition-transform">📊</span> Tokens
                </div>
                <div className="text-2xl font-black text-black group-hover:text-orange-500 transition-colors">{result.tokens_used?.toLocaleString()}</div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
                <div className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wide flex items-center">
                  <span className="text-lg mr-1 group-hover:scale-125 transition-transform">⚡</span> Time
                </div>
                <div className="text-2xl font-black text-black group-hover:text-orange-500 transition-colors">{result.processing_time}s</div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
                <div className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wide flex items-center">
                  <span className="text-lg mr-1 group-hover:scale-125 transition-transform">🤖</span> Model
                </div>
                <div className="text-xs font-black text-black truncate group-hover:text-orange-500 transition-colors" title={result.metadata?.model_name || result.model}>
                  {result.metadata?.model_name || result.model}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutputPane
