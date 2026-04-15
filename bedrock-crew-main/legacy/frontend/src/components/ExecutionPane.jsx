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
          <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded">
            Running
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded">
            Completed
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded">
            Failed
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-200/50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-900">Live Executions</h2>
          </div>
          {isProcessing && (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-100 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-ping"></span>
              Processing
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Execution Logs */}
        {logs.length > 0 ? (
          <div className="p-4 border-b-2 border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-black uppercase tracking-wide">Current Execution</h3>
              <span className="text-xs font-semibold text-gray-600">{logs.length} events</span>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                <span className="text-xs font-bold text-orange-400">⚡ Execution Log</span>
              </div>
              
              <div className="p-3 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start space-x-2 p-2 rounded ${
                      log.type === 'error' ? 'bg-red-900/20' :
                      log.type === 'success' ? 'bg-green-900/20' :
                      log.type === 'agent' ? 'bg-blue-900/20' :
                      ''
                    }`}
                  >
                    <span className="text-gray-500 text-[10px] min-w-[70px]">{log.timestamp}</span>
                    <div className={`${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'agent' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {getLogIcon(log.type)}
                    </div>
                    <span className={`flex-1 ${
                      log.type === 'error' ? 'text-red-300' :
                      log.type === 'success' ? 'text-green-300' :
                      log.type === 'agent' ? 'text-blue-300' :
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
            <div className="p-4 border-b-2 border-gray-200 bg-white">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-black">Initializing execution...</p>
              </div>
            </div>
          )
        )}

        {/* Execution History */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wide mb-3">Execution History</h3>
          
          {executionHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black">No executions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executionHistory.map((execution) => (
                <div
                  key={execution.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-orange-500 transition-colors cursor-pointer"
                  onClick={() => setExpandedExecution(expandedExecution === execution.id ? null : execution.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    {getStatusBadge(execution.status)}
                    <span className="text-xs font-medium text-gray-600">{new Date(execution.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <p className="text-sm font-medium text-black line-clamp-2 mb-2">{execution.input}</p>

                  {execution.result && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-semibold text-black">Intent: {execution.result.intent}</span>
                      {execution.result.tokens_used && (
                        <span className="text-xs text-gray-600">• {execution.result.tokens_used.toLocaleString()} tokens</span>
                      )}
                    </div>
                  )}

                  {expandedExecution === execution.id && execution.result && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 font-medium text-gray-900">{execution.result.processing_time}s</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Model:</span>
                          <span className="ml-1 font-medium text-gray-900 truncate block">{execution.result.metadata?.model_name || execution.result.model}</span>
                        </div>
                      </div>
                      {execution.result.result && (
                        <div className="bg-gray-50 rounded p-2 border border-gray-200">
                          <p className="text-xs text-gray-700 line-clamp-3">{execution.result.result}</p>
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
