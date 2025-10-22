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
  Mail
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

  useEffect(() => {
    loadHelpCenterData()
    setupRealtimeSubscriptions()
  }, [])

  const loadHelpCenterData = async () => {
    try {
      // Load statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_help_center_stats')

      if (statsError) throw statsError
      setStats(statsData[0])

      // Load active screen shares
      const { data: screenShares, error: screenError } = await supabase
        .from('screen_share_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (screenError) throw screenError
      setActiveScreenShares(screenShares || [])

      // Load waiting chats
      const { data: chats, error: chatError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })

      if (chatError) throw chatError
      setWaitingChats(chats || [])

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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <h3 className="text-lg font-medium text-gray-900">Active Screen Shares</h3>
        </div>
        <div className="p-6">
          {activeScreenShares.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active screen sharing sessions</p>
          ) : (
            <div className="space-y-4">
              {activeScreenShares.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">Confirmation Code: {session.confirmation_code}</p>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => joinScreenShare(session.confirmation_code)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Waiting Live Chats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Waiting Live Chats</h3>
        </div>
        <div className="p-6">
          {waitingChats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No waiting live chat sessions</p>
          ) : (
            <div className="space-y-4">
              {waitingChats.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">User ID: {session.user_id}</p>
                      <p className="text-sm text-gray-500">
                        Waiting since: {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startLiveChat(session.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Start Chat
                    </button>
                    <button
                      onClick={() => endLiveChat(session.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      End Chat
                    </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="h-6 w-6 text-green-500 mr-2" />
              <span>Call Customer</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail className="h-6 w-6 text-blue-500 mr-2" />
              <span>Send Email</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenterIntegration





