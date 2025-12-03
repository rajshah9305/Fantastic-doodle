import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc'
import CodeEditor from '@/components/CodeEditor'
import LivePreview from '@/components/LivePreview'
import AIChat from '@/components/AIChat'
import { Download, Save, Play, ArrowLeft, Loader2, Code, Eye } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Editor() {
  const { id } = useParams<{ id: string }>()
  const [, navigate] = useLocation()
  const [code, setCode] = useState('')
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  const appId = parseInt(id || '0', 10)

  // Fetch app data
  const { data: app, isLoading } = trpc.apps.get.useQuery(
    { id: appId },
    { enabled: appId > 0 }
  )

  // Update app mutation
  const updateApp = trpc.apps.update.useMutation({
    onSuccess: () => {
      toast.success('App saved successfully')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    },
  })

  // Modify app with AI
  const modifyApp = trpc.apps.modify.useMutation({
    onSuccess: (data) => {
      const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    ${data.cssCode || ''}
  </style>
</head>
<body>
  ${data.htmlCode || ''}
  <script>
    ${data.jsCode || ''}
  </script>
</body>
</html>`
      setCode(fullCode)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'App updated successfully! Check the preview to see the changes.' 
      }])
    },
    onError: (error) => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I couldn't update the app: ${error.message}` 
      }])
    },
  })

  useEffect(() => {
    if (app) {
      const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.title}</title>
  <style>
    ${app.cssCode || ''}
  </style>
</head>
<body>
  ${app.htmlCode || ''}
  <script>
    ${app.jsCode || ''}
  </script>
</body>
</html>`
      setCode(fullCode)
    }
  }, [app])

  const handleSave = async () => {
    if (!appId) return
    
    // Parse the code to extract HTML, CSS, and JS
    const htmlMatch = code.match(/<body>([\s\S]*?)<\/body>/)
    const cssMatch = code.match(/<style>([\s\S]*?)<\/style>/)
    const jsMatch = code.match(/<script>([\s\S]*?)<\/script>/)

    await updateApp.mutateAsync({
      id: appId,
      htmlCode: htmlMatch ? htmlMatch[1].trim() : '',
      cssCode: cssMatch ? cssMatch[1].trim() : '',
      jsCode: jsMatch ? jsMatch[1].trim() : '',
    })
  }

  const handleAIChat = async (message: string) => {
    if (!appId) return

    setChatMessages(prev => [...prev, { role: 'user', content: message }])

    await modifyApp.mutateAsync({ id: appId, prompt: message })
  }

  const handleDownload = () => {
    if (!app) return

    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${app.title.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('App downloaded successfully')
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">App not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold">{app.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={updateApp.isPending}
          >
            {updateApp.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="editor" className="gap-2">
                  <Code className="w-4 h-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="editor" className="h-full mt-0 p-0">
                <CodeEditor value={code} onChange={setCode} language="html" />
              </TabsContent>

              <TabsContent value="preview" className="h-full mt-0 p-0">
                <LivePreview code={code} title={app.title} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-96 border-l bg-card">
          <AIChat
            messages={chatMessages}
            onSendMessage={handleAIChat}
            isLoading={modifyApp.isPending}
          />
        </div>
      </div>
    </div>
  )
}
