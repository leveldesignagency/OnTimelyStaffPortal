import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  FileText,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CrashReport {
  id: string
  app_version: string
  platform: 'ios' | 'android'
  device_model?: string
  os_version?: string
  error_type: 'crash' | 'error' | 'warning'
  error_message: string
  stack_trace?: string
  user_id?: string
  user_email?: string
  screen_name?: string
  action_taken?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

const CrashReports: React.FC = () => {
  const [reports, setReports] = useState<CrashReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState<CrashReport | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<CrashReport['status']>('open')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('crash_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      console.error('Error loading crash reports:', error)
      toast.error('Failed to load crash reports')
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, status: CrashReport['status'], notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = userId
        if (notes) {
          updateData.resolution_notes = notes
        }
      }

      const { error } = await supabase
        .from('crash_reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) throw error

      toast.success(`Report marked as ${status}`)
      setShowStatusModal(false)
      setSelectedReport(null)
      setResolutionNotes('')
      loadReports()
    } catch (error: any) {
      console.error('Error updating report status:', error)
      toast.error('Failed to update report status')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.app_version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.device_model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter
    const matchesPlatform = platformFilter === 'all' || report.platform === platformFilter

    return matchesSearch && matchesStatus && matchesSeverity && matchesPlatform
  })

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    critical: reports.filter(r => r.severity === 'critical').length,
  }

  const getStatusBadge = (status: CrashReport['status']) => {
    const config = {
      open: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Open' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Closed' },
    }
    const { color, icon: Icon, label } = config[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    )
  }

  const getSeverityBadge = (severity: CrashReport['severity']) => {
    const config = {
      low: { color: 'bg-blue-100 text-blue-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
    }
    const { color, label } = config[severity]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleRowExpansion = (reportId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reportId)) {
        newSet.delete(reportId)
      } else {
        newSet.add(reportId)
      }
      return newSet
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crash Reports</h1>
        <p className="text-gray-600 text-lg">Monitor and manage app crashes and errors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md mb-10 p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by error message, user email, version, or device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
            <button
              onClick={loadReports}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading crash reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No crash reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => {
                  const isExpanded = expandedRows.has(report.id)
                  return (
                    <React.Fragment key={report.id}>
                      <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRowExpansion(report.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {truncateText(report.error_message, 60)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {report.error_type} • v{report.app_version}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {report.user_email || 'Unknown'}
                          </div>
                          {report.screen_name && (
                            <div className="text-xs text-gray-500">{report.screen_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {report.platform === 'ios' ? (
                              <Smartphone className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Monitor className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-900 capitalize">{report.platform}</span>
                          </div>
                          {report.device_model && (
                            <div className="text-xs text-gray-500">{report.device_model}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSeverityBadge(report.severity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(report.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report)
                                setShowDetailModal(true)
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(report)
                                setNewStatus(report.status)
                                setShowStatusModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Filter className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Full Error Message</h4>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 font-mono">
                                  {report.error_message}
                                </p>
                              </div>
                              {report.stack_trace && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">Stack Trace</h4>
                                  <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-48">
                                    {report.stack_trace}
                                  </pre>
                                </div>
                              )}
                              {report.action_taken && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">Action Taken</h4>
                                  <p className="text-sm text-gray-700">{report.action_taken}</p>
                                </div>
                              )}
                              {report.resolution_notes && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">Resolution Notes</h4>
                                  <p className="text-sm text-gray-700">{report.resolution_notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Crash Report Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedReport(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <div className="mt-1">{getSeverityBadge(selectedReport.severity)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Platform</label>
                  <div className="mt-1 text-sm text-gray-900 capitalize">{selectedReport.platform}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">App Version</label>
                  <div className="mt-1 text-sm text-gray-900">v{selectedReport.app_version}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Device Model</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedReport.device_model || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">OS Version</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedReport.os_version || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User Email</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedReport.user_email || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Screen</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedReport.screen_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.created_at)}</div>
                </div>
                {selectedReport.resolved_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resolved At</label>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.resolved_at)}</div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Error Message</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 font-mono">
                  {selectedReport.error_message}
                </p>
              </div>
              {selectedReport.stack_trace && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Stack Trace</label>
                  <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto max-h-96">
                    {selectedReport.stack_trace}
                  </pre>
                </div>
              )}
              {selectedReport.action_taken && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Action Taken</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.action_taken}</p>
                </div>
              )}
              {selectedReport.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolution Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.resolution_notes}</p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedReport(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedReport(selectedReport)
                  setNewStatus(selectedReport.status)
                  setShowStatusModal(true)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Report Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CrashReport['status'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {(newStatus === 'resolved' || newStatus === 'closed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Notes (Optional)
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add notes about how this issue was resolved..."
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedReport(null)
                  setResolutionNotes('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, newStatus, resolutionNotes || undefined)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrashReports

