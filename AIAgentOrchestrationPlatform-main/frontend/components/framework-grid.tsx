"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, TrendingUp, Zap } from "lucide-react"

const frameworks = [
  {
    id: 1, name: "AutoGPT", type: "single-agent", difficulty: "beginner", rating: 4.1, growth: "+42%",
    description: "Autonomous GPT-4 agent that chains together LLM thoughts to autonomously achieve goals.",
    features: ["Autonomous execution", "Goal-oriented", "Memory management"],
    color: "bg-green-500", category: "Automation",
  },
  {
    id: 2, name: "CrewAI", type: "multi-agent", difficulty: "intermediate", rating: 4.7, growth: "+17%",
    description: "Framework for orchestrating role-playing, autonomous AI agents to tackle complex tasks.",
    features: ["Role-playing agents", "Task delegation", "Hierarchical execution"],
    color: "bg-teal-500", category: "Collaboration",
  },
  {
    id: 3, name: "LangGraph", type: "multi-agent", difficulty: "advanced", rating: 4.9, growth: "+57%",
    description: "Library for building stateful, multi-actor applications with LLMs using graph-based workflows.",
    features: ["Graph workflows", "State management", "Multi-actor"],
    color: "bg-purple-500", category: "Workflow",
  },
  {
    id: 4, name: "AutoGen", type: "multi-agent", difficulty: "intermediate", rating: 4.4, growth: "+16%",
    description: "Multi-agent conversation framework with customizable agents that can collaborate to solve complex tasks.",
    features: ["Multi-agent conversations", "Code execution", "Human-in-the-loop"],
    color: "bg-blue-500", category: "Conversation",
  },
  {
    id: 5, name: "BabyAGI", type: "single-agent", difficulty: "beginner", rating: 4.9, growth: "+14%",
    description: "AI-powered task management system that creates, prioritizes, and executes tasks autonomously.",
    features: ["Task creation", "Prioritization", "Execution loop"],
    color: "bg-orange-500", category: "Task Management",
  },
  {
    id: 6, name: "Cerebras", type: "single-agent", difficulty: "beginner", rating: 4.8, growth: "+89%",
    description: "Ultra-fast inference with Cerebras hardware. Run Llama models at unprecedented speeds.",
    features: ["Ultra-fast inference", "Llama models", "Low latency"],
    color: "bg-red-500", category: "Inference",
  },
]

export function FrameworkGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [sortBy, setSortBy] = useState("rating")

  const filtered = frameworks
    .filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = selectedType === "all" || f.type === selectedType
      const matchDiff = selectedDifficulty === "all" || f.difficulty === selectedDifficulty
      return matchSearch && matchType && matchDiff
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "growth") return parseFloat(b.growth) - parseFloat(a.growth)
      return 0
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single-agent">Single Agent</SelectItem>
              <SelectItem value="multi-agent">Multi Agent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((framework, index) => (
          <motion.div
            key={framework.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 hover:bg-white/10 transition-all duration-300 h-full group hover:scale-[1.02]">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${framework.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {framework.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">
                        {framework.name}
                      </h3>
                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                        {framework.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    framework.difficulty === "beginner" ? "bg-green-500/20 text-green-500" :
                    framework.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {framework.difficulty}
                  </Badge>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="border-white/20 text-white/60 text-xs">{framework.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-500 fill-current" />
                      <span className="text-white/80 text-sm font-medium">{framework.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">{framework.growth}</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{framework.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {framework.features.map(f => (
                      <Badge key={f} variant="outline" className="border-white/20 text-white/50 text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-semibold group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all">
                  <Zap className="w-4 h-4 mr-2" />
                  Use Framework
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
