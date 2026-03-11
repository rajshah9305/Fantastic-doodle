import { useEffect, useRef, useState } from 'react'

function ExecutionPane({ logs, isProcessing, executionHistory }) {
  const logsEndRef = useRef(null)
  const [expandedExecution, setExpandedExecution] = useState(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const getLogIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'agent':
        return (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-black text-white bg-orange-500 rounded-full shadow-md animate-pulse">
            ⚡ Running
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-black text-white bg-green-500 rounded-full shadow-md">
            ✓ Completed
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-black text-white bg-red-500 rounded-full shadow-md">
            ✗ Failed
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full glass-effect rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl transform transition-all duration-500">
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-base font-black text-black">Live Executions</h2>
          </div>
          {isProcessing && (
            <span className="inline-flex items-center px-4 py-2 text-xs font-black text-white bg-orange-500 rounded-full shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 bg-white rounded-full mr-2 animate-ping"></span>
              Processing
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Execution Logs */}
        {logs.length > 0 ? (
          <div className="p-6 border-b-2 border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-black uppercase tracking-wide">Current Execution</h3>
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-black text-white bg-orange-500 rounded-full shadow-md">{logs.length} events</span>
            </div>

            <div className="bg-black rounded-2xl border-2 border-gray-800 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-gray-900 border-b-2 border-gray-800 flex items-center justify-between">
                <span className="text-sm font-black text-orange-500 flex items-center">
                  <span className="mr-2">⚡</span> Execution Log
                </span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      log.type === 'error' ? 'bg-red-900/40 border border-red-600' :
                      log.type === 'success' ? 'bg-green-900/40 border border-green-600' :
                      log.type === 'agent' ? 'bg-orange-900/40 border border-orange-600' :
                      'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <span className="text-gray-400 text-[10px] min-w-[75px] font-semibold">{log.timestamp}</span>
                    <div className={`${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'agent' ? 'text-orange-400' :
                      'text-gray-400'
                    }`}>
                      {getLogIcon(log.type)}
                    </div>
                    <span className={`flex-1 font-medium ${
                      log.type === 'error' ? 'text-red-300' :
                      log.type === 'success' ? 'text-green-300' :
                      log.type === 'agent' ? 'text-orange-300' :
                      'text-gray-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        ) : (
          isProcessing && (
            <div className="p-6 border-b-2 border-gray-100 bg-white">
              <div className="text-center py-8">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-orange-500 rounded-full animate-spin opacity-75"></div>
                  <div className="relative bg-white rounded-full w-12 h-12 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-base font-black text-black">Initializing execution...</p>
              </div>
            </div>
          )
        )}

        {/* Execution History */}
        <div className="p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Execution History</h3>
          
          {executionHistory.length === 0 ? (
            <div className="text-center py-12 fade-in">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 float-animation">
                <div className="absolute inset-0 bg-orange-500/10 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative bg-white rounded-3xl w-20 h-20 flex items-center justify-center shadow-xl border-2 border-gray-200">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-black text-black mb-2">No executions yet</p>
              <p className="text-base text-gray-600 mt-2 mb-6">Your execution history will appear here</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold shadow-md">
                  ⚡ Fast Processing
                </div>
                <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-bold text-black shadow-md">
                  📊 Detailed Logs
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {executionHistory.map((execution, index) => (
                <div
                  key={execution.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 slide-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setExpandedExecution(expandedExecution === execution.id ? null : execution.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    {getStatusBadge(execution.status)}
                    <span className="text-xs font-bold text-gray-600">{new Date(execution.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <p className="text-sm font-semibold text-black line-clamp-2 mb-3">{execution.input}</p>

                  {execution.result && (
                    <div className="flex items-center space-x-3 pt-3 border-t-2 border-gray-100">
                      <span className="text-xs font-black text-black">Intent: <span className="text-orange-500">{execution.result.intent}</span></span>
                      {execution.result.tokens_used && (
                        <span className="text-xs font-semibold text-gray-600">• {execution.result.tokens_used.toLocaleString()} tokens</span>
                      )}
                    </div>
                  )}

                  {expandedExecution === execution.id && execution.result && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-600 font-bold">Time:</span>
                          <span className="ml-2 font-black text-black">{execution.result.processing_time}s</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-600 font-bold">Model:</span>
                          <span className="ml-2 font-black text-black truncate block">{execution.result.metadata?.model_name || execution.result.model}</span>
                        </div>
                      </div>
                      {execution.result.result && (
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 shadow-inner">
                          <p className="text-xs font-medium text-black line-clamp-3">{execution.result.result}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExecutionPane
