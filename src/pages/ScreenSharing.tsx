import React, { useState, useRef, useEffect } from 'react'
import { Monitor, Eye, X, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { staffAuth } from '../lib/staffAuth'

const ScreenSharing: React.FC = () => {
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const joinSession = async () => {
    if (!confirmationCode.trim()) {
      setError('Please enter a confirmation code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Validate the confirmation code
      const { data, error: fetchError } = await supabase
        .from('screen_share_sessions')
        .select('*')
        .eq('confirmation_code', confirmationCode.toUpperCase().trim())
        .eq('status', 'active')
        .single()

      if (fetchError || !data) {
        setError('Invalid or expired confirmation code. Please check the code and try again.')
        setLoading(false)
        return
      }

      setSessionData(data)

      // Get current agent user
      const currentUser = await staffAuth.getCurrentUser()
      if (!currentUser) {
        setError('You must be logged in to join a session')
        setLoading(false)
        return
      }

      // Update session with agent assignment
      const { error: updateError } = await supabase
        .from('screen_share_sessions')
        .update({
          agent_id: currentUser.id,
          status: 'active'
        })
        .eq('id', data.id)

      if (updateError) {
        console.warn('Failed to update session with agent:', updateError)
      }

      // For now, we'll set up a basic connection
      // In a full implementation, you'd set up WebRTC here
      setIsConnected(true)
      setLoading(false)

      // Subscribe to session updates
      const channel = supabase
        .channel(`screen_share_${data.id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'screen_share_sessions',
            filter: `id=eq.${data.id}`
          },
          (payload) => {
            if (payload.new.status === 'completed' || payload.new.status === 'expired') {
              handleDisconnect()
            }
          }
        )
        .subscribe()

      // Cleanup subscription on disconnect
      return () => {
        supabase.removeChannel(channel)
      }

    } catch (err: any) {
      console.error('Error joining session:', err)
      setError(err.message || 'Failed to join session. Please try again.')
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsConnected(false)
    setSessionData(null)
    setConfirmationCode('')
    setError(null)
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Monitor className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Screen Sharing</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Enter a confirmation code to view a customer's screen</p>
      </div>

      {!isConnected ? (
        /* Join Session Form */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Join Screen Share Session</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ask the customer for their confirmation code and enter it below
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  id="confirmationCode"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      joinSession()
                    }
                  }}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-3 text-2xl font-mono text-center tracking-normal border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  The customer will provide this code when they start screen sharing
                </p>
              </div>

              <button
                onClick={joinSession}
                disabled={loading || !confirmationCode.trim()}
                className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Monitor className="h-5 w-5" />
                    Join Session
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works:</h3>
            <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
              <li>Customer clicks "Share Screen" in the desktop app</li>
              <li>They receive a 6-character confirmation code</li>
              <li>Customer shares the code with you</li>
              <li>Enter the code above and click "Join Session"</li>
              <li>You'll be able to view their screen in real-time</li>
            </ol>
          </div>
        </div>
      ) : (
        /* Connected View */
        <div className="space-y-10">
          {/* Session Info */}
          {sessionData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Connected to Session</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: <span className="font-mono font-bold text-green-600">{sessionData.confirmation_code}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Disconnect
                </button>
              </div>

              {sessionData.metadata && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">User</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {sessionData.metadata.user_name || sessionData.metadata.user_email || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{sessionData.metadata.user_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Platform</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{sessionData.metadata.platform || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Started</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(sessionData.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screen View */}
          <div className="bg-black rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                style={{ maxHeight: '80vh' }}
              />
              {!videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Monitor className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Waiting for screen share stream...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    The customer's screen will appear here once they start sharing
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Note about WebRTC implementation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Full WebRTC screen sharing implementation is in progress. 
              Currently, the session connection is established. The video stream will be displayed here once WebRTC peer connection is fully configured.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScreenSharing

