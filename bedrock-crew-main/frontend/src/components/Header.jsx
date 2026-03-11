function Header({ onChangeApiKey }) {
  return (
    <header className="glass-effect border-b-2 border-gray-100 shadow-sm relative z-20">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4 group">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg className="w-8 h-8 text-white transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-black">
                Universal <span className="gradient-text animate-gradient bg-[length:200%_auto]">NLP</span>
              </h1>
              <p className="text-xs font-semibold text-gray-600 tracking-wide">Powered by crewAI + Groq</p>
            </div>
          </div>

          {/* API Key Button */}
          <button
            onClick={onChangeApiKey}
            className="inline-flex items-center px-5 py-3 text-sm font-bold text-black bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:text-orange-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 group"
            title="Change API Key"
          >
            <svg className="w-5 h-5 mr-2 transform transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="hidden sm:inline">API Key</span>
            <span className="sm:hidden">Key</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
