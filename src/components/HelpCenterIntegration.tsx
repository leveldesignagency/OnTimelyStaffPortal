// Staff Portal Integration for Help Center
// This component integrates the help center with the OnTimelyStaffPortal

import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Monitor, 
  Users, 
  Clock, 
  AlertCircle,
  Eye,
  Phone,
  Mail,
  X,
  Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface HelpCenterStats {
  totalChatSessions: number
  totalScreenShares: number
  totalLiveChats: number
  avgResponseTime: string
  mostVisitedPage: string
}

interface ScreenShareSession {
  id: string
  confirmation_code: string
  user_id: string
  status: 'active' | 'completed' | 'expired'
  created_at: string
  expires_at: string
}

interface LiveChatSession {
  id: string
  user_id: string
  agent_id: string
  status: 'waiting' | 'active' | 'ended'
  started_at: string
  ended_at: string
  created_at?: string
}

const HelpCenterIntegration: React.FC = () => {
  const [stats, setStats] = useState<HelpCenterStats | null>(null)
  const [activeScreenShares, setActiveScreenShares] = useState<ScreenShareSession[]>([])
  const [waitingChats, setWaitingChats] = useState<LiveChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [searchCode, setSearchCode] = useState('')
  const [filteredScreenShares, setFilteredScreenShares] = useState<ScreenShareSession[]>([])

  useEffect(() => {
    loadHelpCenterData()
    setupRealtimeSubscriptions()
    
    // Check if user has previously dismissed the instructions
    const hasSeenInstructions = localStorage.getItem('help-center-instructions-dismissed')
    if (hasSeenInstructions === 'true') {
      setShowInstructions(false)
    }
  }, [])

  // Filter screen shares based on search code
  useEffect(() => {
    if (searchCode.trim() === '') {
      setFilteredScreenShares(activeScreenShares)
    } else {
      const filtered = activeScreenShares.filter(session => 
        session.confirmation_code.toLowerCase().includes(searchCode.toLowerCase())
      )
      setFilteredScreenShares(filtered)
    }
  }, [activeScreenShares, searchCode])

  const dismissInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('help-center-instructions-dismissed', 'true')
  }

  const showInstructionsAgain = () => {
    setShowInstructions(true)
    localStorage.removeItem('help-center-instructions-dismissed')
  }

  const loadHelpCenterData = async () => {
    try {
      console.log('🔍 Loading help center data...')
      
      // Load statistics (with fallback if RPC doesn't exist)
      let statsData = null
      try {
        const { data, error } = await supabase.rpc('get_help_center_stats')
        if (error) {
          console.warn('RPC get_help_center_stats failed, using fallback:', error)
          statsData = [{ totalChatSessions: 0, totalScreenShares: 0, totalLiveChats: 0, avgResponseTime: 'N/A' }]
        } else {
          statsData = data
        }
      } catch (rpcError) {
        console.warn('RPC not available, using fallback stats:', rpcError)
        statsData = [{ totalChatSessions: 0, totalScreenShares: 0, totalLiveChats: 0, avgResponseTime: 'N/A' }]
      }
      setStats(statsData[0])

      // Load active screen shares
      console.log('🔍 Loading screen share sessions...')
      const { data: screenShares, error: screenError } = await supabase
        .from('screen_share_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (screenError) {
        console.error('Error loading screen shares:', screenError)
        setActiveScreenShares([])
      } else {
        console.log('✅ Loaded screen shares:', screenShares)
        setActiveScreenShares(screenShares || [])
      }

      // Load waiting chats (with fallback if table doesn't exist)
      console.log('🔍 Loading live chat sessions...')
      const { data: chats, error: chatError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })

      if (chatError) {
        console.warn('Live chat sessions table not available:', chatError)
        setWaitingChats([])
      } else {
        setWaitingChats(chats || [])
      }

    } catch (error) {
      console.error('Error loading help center data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to screen share sessions
    supabase
      .channel('screen_share_sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'screen_share_sessions' },
        () => loadHelpCenterData()
      )
      .subscribe()

    // Subscribe to live chat sessions
    supabase
      .channel('live_chat_sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'live_chat_sessions' },
        () => loadHelpCenterData()
      )
      .subscribe()
  }

  const joinScreenShare = async (confirmationCode: string) => {
    try {
      // Validate the confirmation code
      const { data, error } = await supabase
        .from('screen_share_sessions')
        .select('*')
        .eq('confirmation_code', confirmationCode)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        alert('Invalid or expired confirmation code')
        return
      }

      // Update session with agent assignment
      const { error: updateError } = await supabase
        .from('screen_share_sessions')
        .update({ 
          agent_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        })
        .eq('id', data.id)

      if (updateError) throw updateError

      alert(`Screen sharing session joined! Confirmation code: ${confirmationCode}`)
      loadHelpCenterData()

    } catch (error) {
      console.error('Error joining screen share:', error)
      alert('Error joining screen sharing session')
    }
  }

  const startLiveChat = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          agent_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error

      alert('Live chat session started!')
      loadHelpCenterData()

    } catch (error) {
      console.error('Error starting live chat:', error)
      alert('Error starting live chat session')
    }
  }

  const endLiveChat = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error

      alert('Live chat session ended')
      loadHelpCenterData()

    } catch (error) {
      console.error('Error ending live chat:', error)
      alert('Error ending live chat session')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Screen Sharing Instructions */}
      {showInstructions && (
        <div className="relative">
          {/* Close Button - Outside Container */}
          <button
            onClick={dismissInstructions}
            className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            title="Dismiss instructions"
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Instructions Container */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Join Screen Sharing</h3>
                <div className="text-blue-800 space-y-2">
                  <p><strong>Step 1:</strong> When a user requests screen sharing, they'll receive a confirmation code</p>
                  <p><strong>Step 2:</strong> The session will appear in "Active Screen Shares" below</p>
                  <p><strong>Step 3:</strong> Click "Join Session" to connect to their screen</p>
                  <p><strong>Step 4:</strong> You'll be able to see their screen and provide remote assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Instructions Button (when hidden) */}
      {!showInstructions && (
        <div className="flex justify-center">
          <button
            onClick={showInstructionsAgain}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="mr-2">ℹ️</span>
            Show Screen Sharing Instructions
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalChatSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Monitor className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Screen Shares</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalScreenShares || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Chats</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalLiveChats || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.avgResponseTime || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Screen Shares */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Screen Shares</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {activeScreenShares.length} Active
            </span>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by confirmation code..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="p-6">
          {filteredScreenShares.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchCode ? 'No Matching Screen Shares' : 'No Active Screen Shares'}
              </h3>
              <p className="text-gray-500">
                {searchCode 
                  ? `No sessions found matching "${searchCode}"`
                  : 'When users request screen sharing, their sessions will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScreenShares.map((session) => (
                <div key={session.id} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 mr-2">Confirmation Code:</span>
                          <span className="font-mono text-lg font-bold text-green-700 bg-green-100 px-3 py-1 rounded">
                            {session.confirmation_code}
                          </span>
                        </div>
                        
                        {/* User Information */}
                        {session.metadata && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              👤 {session.metadata.user_name || session.metadata.user_email || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              📧 {session.metadata.user_email || 'No email'}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              🏢 Company: {session.metadata.company_id || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-600">
                              💻 Platform: {session.metadata.platform || 'Unknown'} | App: {session.metadata.app_version || 'Unknown'}
                            </p>
                            {session.metadata.resolution && (
                              <p className="text-xs text-gray-600 mt-1">
                                📊 Resolution: {session.metadata.resolution} | FPS: {session.metadata.frame_rate || 'Unknown'}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Started: {new Date(session.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          User is waiting for you to join their screen
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => joinScreenShare(session.confirmation_code)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                      Join Screen Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Waiting Live Chats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Waiting Live Chats</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {waitingChats.length} Waiting
            </span>
          </div>
        </div>
        <div className="p-6">
          {waitingChats.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Waiting Chats</h3>
              <p className="text-gray-500">When users request live chat support, their sessions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitingChats.map((session) => (
                <div key={session.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 mr-2">User ID:</span>
                          <span className="font-mono text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {session.user_id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Waiting since: {new Date(session.started_at ?? session.created_at ?? new Date().toISOString()).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          User is waiting for live chat support
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => startLiveChat(session.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                      >
                        Start Chat
                      </button>
                      <button
                        onClick={() => endLiveChat(session.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm hover:shadow-md"
                      >
                        End Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="flex items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all duration-200 group">
              <Phone className="h-6 w-6 text-green-500 mr-3 group-hover:text-green-600" />
              <span className="font-medium text-gray-700 group-hover:text-gray-900">Call Customer</span>
            </button>
            <button className="flex items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group">
              <Mail className="h-6 w-6 text-blue-500 mr-3 group-hover:text-blue-600" />
              <span className="font-medium text-gray-700 group-hover:text-gray-900">Send Email</span>
            </button>
            <button className="flex items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all duration-200 group">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-3 group-hover:text-orange-600" />
              <span className="font-medium text-gray-700 group-hover:text-gray-900">Create Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenterIntegration





