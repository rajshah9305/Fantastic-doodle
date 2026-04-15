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
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400">💻 Code Output</span>
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <pre className="p-5 text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
            {result.result}
          </pre>
        </div>
      )
    }

    return (
      <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="text-sm text-gray-900 font-medium leading-relaxed whitespace-pre-wrap break-words">
          {result.result}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-200/50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-900">Generated Output</h2>
          </div>
          {result && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/40"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black">Generating output...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-red-900 mb-1">Error</h3>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-black mb-1">Ready to Generate</h3>
              <p className="text-sm text-gray-600">Enter your task below to see output</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Intent Badge */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                {result.intent}
              </span>
              {isCodeOutput(result.result) && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                  Code
                </span>
              )}
            </div>

            {/* Output */}
            {renderOutput()}

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-orange-600 mb-1">📊 Tokens</div>
                <div className="text-xl font-bold text-gray-900">{result.tokens_used?.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-blue-600 mb-1">⚡ Time</div>
                <div className="text-xl font-bold text-gray-900">{result.processing_time}s</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-purple-600 mb-1">🤖 Model</div>
                <div className="text-xs font-bold text-gray-900 truncate" title={result.metadata?.model_name || result.model}>
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
