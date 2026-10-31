import { useState, useEffect, useRef } from 'react'
import { Search, Send, MessageSquare, User } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useSearchParams } from 'react-router-dom'

const SellerMessages = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto-select conversation if a booking or property page specifies one.
    const conversationId = searchParams.get('conversationId')
    const buyerId = searchParams.get('buyerId')
    if ((conversationId || buyerId) && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId || c.buyer?._id === buyerId)
      if (conversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [searchParams, conversations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/conversations')
      setConversations(response.data.data?.conversations || [])
    } catch (err) {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`)
      setMessages(response.data.data?.messages || [])
    } catch (err) {
      toast.error('Failed to load messages')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await api.post(
        `/conversations/${selectedConversation._id}/messages`,
        { content: newMessage.trim() }
      )
      const message = response.data.data.message
      
      setMessages((current) => [...current, message])
      setNewMessage('')
      
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: message.content, lastMessageAt: message.createdAt }
          : conv
      ))
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.buyer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Chat with potential buyers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="input-field pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map(conversation => (
                    <button
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {conversation.property?.images?.[0] ? (
                              <img
                                src={conversation.property.images[0].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.buyer?.fullName}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {conversation.property?.title || 'Unknown Property'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage || 'Start a conversation'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.lastMessageAt && 
                              new Date(conversation.lastMessageAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 flex flex-col hidden md:flex">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.buyer?.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        About: {selectedConversation.property?.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => {
                    const isOwn = message.sender?._id !== selectedConversation.buyer._id
                    return (
                      <div
                        key={message._id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {new Date(message.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="input-field flex-1"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-600">
                    Select a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerMessages
