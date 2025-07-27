'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI portfolio assistant. I can help you explore my creator's projects, skills, and experience. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'm a Senior Frontend Developer with 4.5 years of experience specializing in Next.js, React, and TypeScript. I've built scalable applications for e-commerce, fintech, and SaaS companies.",
        "My technical stack includes Next.js 14, React 18, TypeScript, Tailwind CSS, Node.js, and AWS. I'm passionate about creating beautiful, performant user interfaces.",
        "I've deployed applications on AWS, Vercel, and Netlify. I'm experienced with CI/CD pipelines, Docker, and cloud architecture.",
        "I'm currently looking for remote opportunities at $25-30/hr. I can handle full-stack development, from UI/UX design to backend API development.",
        "Some of my recent projects include an AI-powered dashboard, a real-time e-commerce platform, and a portfolio builder with drag-and-drop functionality.",
        "I'm experienced with modern development practices including Git, Agile methodologies, code reviews, and team leadership. I can work independently or as part of a team."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Portfolio Assistant</h1>
              <p className="text-gray-300">Interactive showcase of my skills and experience</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Available for hire</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <span className="text-white font-semibold">$25-30/hr</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">Chat with AI Assistant</h2>
                <p className="text-gray-300 text-sm">Ask about my skills, projects, or experience</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 text-white px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about my skills, projects, or experience..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Experience</span>
                  <span className="text-white font-semibold">4.5 Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Projects</span>
                  <span className="text-white font-semibold">50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Technologies</span>
                  <span className="text-white font-semibold">15+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rate</span>
                  <span className="text-white font-semibold">$25-30/hr</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Core Skills</h3>
              <div className="space-y-3">
                {[
                  { skill: 'Next.js', level: 95 },
                  { skill: 'React', level: 90 },
                  { skill: 'TypeScript', level: 85 },
                  { skill: 'Tailwind CSS', level: 90 },
                  { skill: 'Node.js', level: 75 },
                  { skill: 'AWS', level: 70 }
                ].map((item) => (
                  <div key={item.skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-sm">{item.skill}</span>
                      <span className="text-white text-sm">{item.level}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Get In Touch</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                  View Full Portfolio
                </button>
                <button className="w-full px-4 py-2 border border-white/30 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300">
                  Download Resume
                </button>
                <button className="w-full px-4 py-2 border border-white/30 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300">
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
