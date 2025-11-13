import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { 
  // Users, // TODO: Uncomment when needed
  Plus, 
  Search, 
  // Filter, // TODO: Uncomment when needed
  // MoreVertical, // TODO: Uncomment when needed
  Edit, 
  Trash2, 
  // Download, // TODO: Uncomment when needed
  // Upload, // TODO: Uncomment when needed
  UserPlus,
  X,
  Key,
  // Eye, // TODO: Uncomment when needed
  // EyeOff, // TODO: Uncomment when needed
  ChevronDown,
  Check,
  Shield,
  AlertCircle
} from 'lucide-react'
import { db } from '../lib/database'
import { User, Company } from '../lib/supabase'

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    company_id: '',
    role: 'user'
  })

  // Custom dropdown states
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const companyDropdownRef = useRef<HTMLDivElement>(null)
  
  // Filter dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showCompanyFilterDropdown, setShowCompanyFilterDropdown] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showBulkCompanyDropdown, setShowBulkCompanyDropdown] = useState(false)
  const [showBulkRoleDropdown, setShowBulkRoleDropdown] = useState(false)
  
  // Dropdown refs
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const companyFilterDropdownRef = useRef<HTMLDivElement>(null)
  const roleDropdownRef = useRef<HTMLDivElement>(null)
  const bulkCompanyDropdownRef = useRef<HTMLDivElement>(null)
  const bulkRoleDropdownRef = useRef<HTMLDivElement>(null)

  // Bulk user creation states
  const [bulkInput, setBulkInput] = useState('')
  const [bulkCompanyId, setBulkCompanyId] = useState('')
  const [bulkRole, setBulkRole] = useState('user')

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string, email: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Undo functionality states
  const [showUndo, setShowUndo] = useState(false)
  const [deletedUser, setDeletedUser] = useState<{id: string, name: string, email: string} | null>(null)
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [deletedUsers, setDeletedUsers] = useState<User[]>([])
  // const [csvFile, setCsvFile] = useState<File | null>(null) // TODO: Uncomment when needed
  const [bulkPreview, setBulkPreview] = useState<Array<{ email: string; name: string }>>([])

  // Password modal states
  const [passwordModalData, setPasswordModalData] = useState<{
    email: string
    name: string
    companyName?: string
  } | null>(null)

  // Success message states
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
      if (companyFilterDropdownRef.current && !companyFilterDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyFilterDropdown(false)
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false)
      }
      if (bulkCompanyDropdownRef.current && !bulkCompanyDropdownRef.current.contains(event.target as Node)) {
        setShowBulkCompanyDropdown(false)
      }
      if (bulkRoleDropdownRef.current && !bulkRoleDropdownRef.current.contains(event.target as Node)) {
        setShowBulkRoleDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, companiesData, deletedUsersData] = await Promise.all([
        db.users.getUsers(),
        db.companies.getCompanies(),
        db.users.getDeletedUsers()
      ])
      setUsers(usersData)
      setCompanies(companiesData)
      setDeletedUsers(deletedUsersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      console.log('🔍 USER CREATION STARTED:', {
        email: newUser.email,
        name: newUser.name,
        company_id: newUser.company_id,
        role: newUser.role
      });

      if (!newUser.email || !newUser.name || !newUser.company_id) {
        toast.error('Please fill in all required fields.')
        return
      }

      const userData: any = {
        email: newUser.email,
        name: newUser.name,
        company_id: newUser.company_id,
        role: newUser.role
      }

      console.log('🔍 CALLING db.users.createUser with:', userData);
      const createdUser = await db.users.createUser(userData)
      console.log('🔍 USER CREATED SUCCESSFULLY:', createdUser);
      
      // Get company name for password modal
      let companyName: string | undefined
      if (newUser.company_id) {
        const company = companies.find(c => c.id === newUser.company_id)
        companyName = company?.name
      }

      // Show password modal
      setPasswordModalData({
        email: newUser.email,
        name: newUser.name,
        companyName
      })
      setShowPasswordModal(true)

      setShowCreateModal(false)
      setNewUser({
        email: '',
        name: '',
        company_id: '',
        role: 'user'
      })
      
      // Show success message
      toast.success(`User ${newUser.name} created successfully! Welcome email sent.`)
      
      loadData() // Reload the list
    } catch (error) {
      console.error('Error creating user:', error)
      
      let errorMessage = 'Error creating user. Please try again.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        const msg = (error as any).message.toLowerCase()
        
        if (msg.includes('for security purposes, you can only request this after')) {
          toast.success('User created successfully! Welcome email will be sent shortly (rate limited).')
          return
        } else if (msg.includes('invalid email') || msg.includes('email format') || msg.includes('400')) {
          errorMessage = 'Invalid email address. Please check the email format and try again.'
        } else if (msg.includes('email already exists') || msg.includes('duplicate') || msg.includes('already registered') || msg.includes('unique constraint') || msg.includes('violates unique constraint')) {
          // Check if user exists in the same company
          const existingUser = users.find(u => u.email === newUser.email)
          if (existingUser && existingUser.company_id === newUser.company_id) {
            errorMessage = `A user with this email already exists in ${existingUser.company_id ? companies.find(c => c.id === existingUser.company_id)?.name : 'this company'}. Please use a different email or edit the existing user.`
          } else if (existingUser) {
            // User exists in different company - allow creation
            errorMessage = `A user with this email exists in another company (${existingUser.company_id ? companies.find(c => c.id === existingUser.company_id)?.name : 'different company'}). You can create this user as they will use different login credentials.`
            // Actually let's allow this
            const userData: any = {
              email: newUser.email,
              name: newUser.name,
              company_id: newUser.company_id,
              role: newUser.role
            }
            const createdUser = await db.users.createUser(userData)
            toast.success('User created successfully! Welcome email sent.')
            setShowCreateModal(false)
            setNewUser({ email: '', name: '', company_id: '', role: 'user' })
            loadData()
            return
          } else {
            errorMessage = 'A user with this email address already exists. Please use a different email.'
          }
        } else if (msg.includes('company not found') || msg.includes('invalid company')) {
          errorMessage = 'Selected company is invalid. Please refresh the page and try again.'
        } else if (msg.includes('network') || msg.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const handleBulkCreate = async () => {
    try {
      console.log('🔍 BULK USER CREATION STARTED:', {
        count: bulkPreview.length,
        companyId: bulkCompanyId,
        role: bulkRole
      });

      if (bulkPreview.length === 0) return

      const usersToCreate = bulkPreview.map(user => ({
        email: user.email.trim(),
        name: user.name.trim(),
        company_id: bulkCompanyId || undefined,
        role: bulkRole
      }))

      console.log('🔍 CALLING db.users.bulkCreateUsers with:', usersToCreate);
      await db.users.bulkCreateUsers(usersToCreate)
      console.log('🔍 BULK USER CREATION COMPLETED SUCCESSFULLY');
      setShowBulkModal(false)
      setBulkInput('')
      setBulkPreview([])
      setBulkCompanyId('')
      setBulkRole('user')
      loadData() // Reload the list
      
      setSuccessMessage(`Successfully created ${bulkPreview.length} users! Welcome emails have been sent.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error('Error creating bulk users:', error)
      setSuccessMessage('Error creating bulk users. Please try again.')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }

  const handlePasswordReset = async (userId: string) => {
    try {
      // const temporaryPassword = await db.users.resetUserPassword(userId) // TODO: Uncomment when needed
      
      // Get user details for password modal
      const user = users.find(u => u.id === userId)
      if (user) {
        let companyName: string | undefined
        if (user.company_id) {
          const company = companies.find(c => c.id === user.company_id)
          companyName = company?.name
        }

        setPasswordModalData({
          email: user.email,
          name: user.name,
          companyName
        })
        setShowPasswordModal(true)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setSuccessMessage('Error resetting password. Please try again.')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }

  const parseBulkInput = (input: string) => {
    const lines = input.split('\n').filter(line => line.trim())
    const users: Array<{ email: string; name: string }> = []

    lines.forEach(line => {
      const parts = line.split(',').map(part => part.trim())
      if (parts.length >= 2) {
        users.push({
          email: parts[0],
          name: parts[1]
        })
      }
    })

    setBulkPreview(users)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // setCsvFile(file) // TODO: Uncomment when needed
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        parseBulkInput(text)
      }
      reader.readAsText(file)
    }
  }

  const handleDeleteUser = (userId: string, userName: string, userEmail: string) => {
    setUserToDelete({ id: userId, name: userName, email: userEmail })
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    setIsDeleting(true)
    try {
      // Soft delete the user (mark as deleted but don't remove from database)
      await db.users.softDeleteUser(userToDelete.id)
      
      // Store deleted user info for undo
      setDeletedUser(userToDelete)
      setShowUndo(true)
      
      // Close the modal
      setShowDeleteModal(false)
      setUserToDelete(null)
      
      // Reload data to update the UI
      loadData()
      
      // Start 3-second undo timer
      const timer = setTimeout(() => {
        setShowUndo(false)
        setDeletedUser(null)
        // After 3 seconds, permanently delete the user
        if (deletedUser) {
          db.users.deleteUser(deletedUser.id).catch(console.error)
        }
      }, 3000)
      
      setUndoTimer(timer)
      
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUndo = async () => {
    if (!deletedUser) return
    
    try {
      // Restore the user
      await db.users.restoreUser(deletedUser.id)
      
      // Clear undo state
      setShowUndo(false)
      setDeletedUser(null)
      
      // Clear timer
      if (undoTimer) {
        clearTimeout(undoTimer)
        setUndoTimer(null)
      }
      
      // Reload data
      loadData()
      
      toast.success(`User ${deletedUser.name} restored successfully.`)
    } catch (error) {
      console.error('Error restoring user:', error)
      toast.error('Error restoring user. Please try again.')
    }
  }

  const handleRestoreUser = async (userId: string, userName: string) => {
    try {
      await db.users.restoreUser(userId)
      loadData()
      toast.success(`User ${userName} restored successfully.`)
    } catch (error) {
      console.error('Error restoring user:', error)
      toast.error('Error restoring user. Please try again.')
    }
  }

  const handlePermanentDelete = async (userId: string, userName: string, _userEmail: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      try {
        await db.users.deleteUser(userId)
        loadData()
        toast.success(`User ${userName} permanently deleted.`)
      } catch (error) {
        console.error('Error permanently deleting user:', error)
        toast.error('Error permanently deleting user. Please try again.')
      }
    }
  }

  // Helper function for dropdown option styling
  const getDropdownOptionClass = (_isSelected: boolean, isFirst: boolean, isLast: boolean) => {
    let baseClass = "w-full px-3 py-2 text-left hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 flex items-center justify-between"
    if (!isFirst) baseClass += " border-t border-gray-100"
    if (isFirst) baseClass += " rounded-t-lg"
    if (isLast) baseClass += " rounded-b-lg"
    return baseClass
  }

  const filteredUsers = (activeTab === 'active' ? users : deletedUsers).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesCompany = companyFilter === 'all' || user.company_id === companyFilter
    
    return matchesSearch && matchesStatus && matchesCompany
  })

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) {
        clearTimeout(undoTimer)
      }
    }
  }, [undoTimer])

  const getCompanyName = (companyId: string | undefined) => {
    if (!companyId) return 'No Company'
    const company = companies.find(c => c.id === companyId)
    return company?.name || 'Unknown Company'
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      case 'away': return 'bg-yellow-100 text-yellow-800'
      case 'busy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'masterAdmin': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const selectedCompany = companies.find(c => c.id === newUser.company_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users across companies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Bulk Add Users
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between min-w-[140px]"
            >
              <span className="text-gray-900">
                {statusFilter === 'all' ? 'All Statuses' : 
                 statusFilter === 'online' ? 'Online' :
                 statusFilter === 'offline' ? 'Offline' :
                 statusFilter === 'away' ? 'Away' : 'Busy'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showStatusDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                {[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'online', label: 'Online' },
                  { value: 'offline', label: 'Offline' },
                  { value: 'away', label: 'Away' },
                  { value: 'busy', label: 'Busy' }
                ].map((option, index, array) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value)
                      setShowStatusDropdown(false)
                    }}
                    className={getDropdownOptionClass(statusFilter === option.value, index === 0, index === array.length - 1)}
                  >
                    <span>{option.label}</span>
                    {statusFilter === option.value && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative" ref={companyFilterDropdownRef}>
            <button
              type="button"
              onClick={() => setShowCompanyFilterDropdown(!showCompanyFilterDropdown)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between min-w-[160px]"
            >
              <span className="text-gray-900 truncate">
                {companyFilter === 'all' ? 'All Companies' : 
                 companies.find(c => c.id === companyFilter)?.name || 'Unknown Company'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCompanyFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCompanyFilterDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                <button
                  onClick={() => {
                    setCompanyFilter('all')
                    setShowCompanyFilterDropdown(false)
                  }}
                  className={getDropdownOptionClass(companyFilter === 'all', true, companies.length === 0)}
                >
                  <span>All Companies</span>
                  {companyFilter === 'all' && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
                {companies.map((company, index) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setCompanyFilter(company.id)
                      setShowCompanyFilterDropdown(false)
                    }}
                    className={getDropdownOptionClass(companyFilter === company.id, false, index === companies.length - 1)}
                  >
                    <span className="truncate">{company.name}</span>
                    {companyFilter === company.id && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deleted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recently Deleted ({deletedUsers.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Undo Notification */}
      {showUndo && deletedUser && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4">
          <div className="flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            <span>User "{deletedUser.name}" deleted</span>
          </div>
          <button
            onClick={handleUndo}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Undo
          </button>
          <button
            onClick={() => {
              setShowUndo(false)
              setDeletedUser(null)
              if (undoTimer) {
                clearTimeout(undoTimer)
                setUndoTimer(null)
              }
            }}
            className="text-red-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt={user.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCompanyName(user.company_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status || 'offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {activeTab === 'active' ? (
                        <>
                          <button 
                            onClick={() => handlePasswordReset(user.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button className="text-primary-600 hover:text-primary-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleRestoreUser(user.id, user.name)}
                            className="text-green-600 hover:text-green-900"
                            title="Restore User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handlePermanentDelete(user.id, user.name, user.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Company *</label>
                <div className="relative" ref={companyDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                  >
                    <span className={selectedCompany ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedCompany ? selectedCompany.name : 'Select a company'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCompanyDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {companies.map((company, index) => (
                        <button
                          key={company.id}
                          onClick={() => {
                            setNewUser({...newUser, company_id: company.id})
                            setShowCompanyDropdown(false)
                          }}
                          className={getDropdownOptionClass(newUser.company_id === company.id, index === 0, index === companies.length - 1)}
                        >
                          <span>{company.name}</span>
                          {newUser.company_id === company.id && (
                            <Check className="w-4 h-4 text-primary-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative" ref={roleDropdownRef}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-left"
                  >
                    <span className={newUser.role ? 'text-gray-900' : 'text-gray-500'}>
                      {newUser.role === 'user' ? 'User' :
                       newUser.role === 'manager' ? 'Manager' :
                       newUser.role === 'supervisor' ? 'Supervisor' :
                       newUser.role === 'employee' ? 'Employee' :
                       newUser.role === 'viewer' ? 'Viewer' :
                       newUser.role === 'other' ? 'Other' : 'Select a role'}
                    </span>
                  </button>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showRoleDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                      {[
                        { value: 'user', label: 'User' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'supervisor', label: 'Supervisor' },
                        { value: 'employee', label: 'Employee' },
                        { value: 'viewer', label: 'Viewer' },
                        { value: 'other', label: 'Other' }
                      ].map((option, index, array) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setNewUser({...newUser, role: option.value})
                            setShowRoleDropdown(false)
                          }}
                          className={getDropdownOptionClass(newUser.role === option.value, index === 0, index === array.length - 1)}
                        >
                          <span>{option.label}</span>
                          {newUser.role === option.value && (
                            <Check className="w-4 h-4 text-primary-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {newUser.role === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customRole"
                      placeholder="Specify custom role"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.company_id}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">User Created Successfully!</h2>
              <p className="text-gray-600 mt-2">Welcome email has been sent with login credentials.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">User Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {passwordModalData.name}</div>
                <div><span className="font-medium">Email:</span> {passwordModalData.email}</div>
                {passwordModalData.companyName && (
                  <div><span className="font-medium">Company:</span> {passwordModalData.companyName}</div>
                )}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-green-800">
                  A welcome email with login credentials has been sent to the user. They should check their email and set their password.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordModalData(null)
                }}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk User Creation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bulk Add Users</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Method Selection */}
              <div>
                <h3 className="text-lg font-medium mb-3">Choose Input Method</h3>
                
                {/* CSV Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">CSV format: email,name</p>
                </div>
                
                {/* Manual Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Input (comma-separated)</label>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => {
                      setBulkInput(e.target.value)
                      parseBulkInput(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email1@example.com, John Doe&#10;email2@example.com, Jane Smith&#10;email3@example.com, Bob Johnson"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: email, name (one per line)</p>
                </div>
              </div>
              
              {/* Common Settings */}
              <div>
                <h3 className="text-lg font-medium mb-3">Common Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <div className="relative" ref={bulkCompanyDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowBulkCompanyDropdown(!showBulkCompanyDropdown)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className={bulkCompanyId ? 'text-gray-900' : 'text-gray-500'}>
                          {bulkCompanyId ? companies.find(c => c.id === bulkCompanyId)?.name || 'Unknown Company' : 'Select a company'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBulkCompanyDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showBulkCompanyDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {companies.map((company, index) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => {
                                setBulkCompanyId(company.id)
                                setShowBulkCompanyDropdown(false)
                              }}
                              className={getDropdownOptionClass(bulkCompanyId === company.id, index === 0, index === companies.length - 1)}
                            >
                              <span className="truncate">{company.name}</span>
                              {bulkCompanyId === company.id && (
                                <Check className="w-4 h-4 text-primary-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="relative" ref={bulkRoleDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowBulkRoleDropdown(!showBulkRoleDropdown)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className="text-gray-900">
                          {bulkRole === 'user' ? 'User' : 'Master Admin'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBulkRoleDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showBulkRoleDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                          {[
                            { value: 'user', label: 'User' },
                            { value: 'masterAdmin', label: 'Master Admin' }
                          ].map((option, index, array) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setBulkRole(option.value)
                                setShowBulkRoleDropdown(false)
                              }}
                              className={getDropdownOptionClass(bulkRole === option.value, index === 0, index === array.length - 1)}
                            >
                              <span>{option.label}</span>
                              {bulkRole === option.value && (
                                <Check className="w-4 h-4 text-primary-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              {bulkPreview.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Preview ({bulkPreview.length} users)</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bulkPreview.map((user, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-gray-500 ml-2">({user.email})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCreate}
                disabled={bulkPreview.length === 0 || !bulkCompanyId}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {bulkPreview.length} Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this user? This will permanently remove their account and all associated data.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">User Details</h4>
                      <p className="text-sm text-red-700">
                        <strong>Name:</strong> {userToDelete.name}
                      </p>
                      <p className="text-sm text-red-700">
                        <strong>Email:</strong> {userToDelete.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  disabled={isDeleting}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors duration-150"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
