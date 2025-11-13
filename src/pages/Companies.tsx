import React, { useState, useEffect, useRef } from 'react'
import { Search, Plus, /* Filter, */ MoreVertical, Building2, Users, /* Mail, Phone, MapPin */ ChevronDown, Check, Trash2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/database'
import { Company } from '@/lib/supabase'

const Companies: React.FC = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUndo, setShowUndo] = useState(false)
  const [deletedCompany, setDeletedCompany] = useState<Company | null>(null)
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [deletedCompanies, setDeletedCompanies] = useState<Company[]>([])
  
  // Custom dropdown states
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)
  const planDropdownRef = useRef<HTMLDivElement>(null)
  const [newCompany, setNewCompany] = useState({
    name: '',
    subscription_plan: 'basic' as string,
    max_users: 5
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (activeTab === 'deleted') {
      loadDeletedCompanies()
    }
  }, [activeTab])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm, planFilter])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target as Node)) {
        setShowPlanDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await db.companies.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
      // You could add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedCompanies = async () => {
    try {
      const data = await db.companies.getDeletedCompanies()
      setDeletedCompanies(data)
    } catch (error) {
      console.error('Error loading deleted companies:', error)
    }
  }

  const filterCompanies = () => {
    let filtered = companies

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(company => company.subscription_plan === planFilter)
    }

    setFilteredCompanies(filtered)
  }

  // Helper function for dropdown option styling
  const getDropdownOptionClass = (_isSelected: boolean, isFirst: boolean, isLast: boolean) => {
    let baseClass = "w-full px-3 py-2 text-left hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 flex items-center justify-between"
    if (!isFirst) baseClass += " border-t border-gray-100"
    if (isFirst) baseClass += " rounded-t-lg"
    if (isLast) baseClass += " rounded-b-lg"
    return baseClass
  }

  const handleCreateCompany = async () => {
    try {
      // Only send the fields that are provided, let Supabase handle defaults
      const companyData: any = { name: newCompany.name }
      
      if (newCompany.subscription_plan && newCompany.subscription_plan !== 'basic') {
        companyData.subscription_plan = newCompany.subscription_plan
      }
      
      if (newCompany.max_users && newCompany.max_users !== 5) {
        companyData.max_users = newCompany.max_users
      }

      await db.companies.createCompany(companyData)
      setShowCreateModal(false)
      setNewCompany({
        name: '',
        subscription_plan: 'basic',
        max_users: 5
      })
      loadCompanies() // Reload the list
    } catch (error) {
      console.error('Error creating company:', error)
      // You could add a toast notification here
    }
  }

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteConfirmation('')
    setShowDeleteModal(true)
  }

  const confirmDeleteCompany = async () => {
    if (!companyToDelete || deleteConfirmation !== companyToDelete.name) {
      return
    }

    setIsDeleting(true)
    try {
      // Soft delete the company
      await db.companies.softDeleteCompany(companyToDelete.id)
      
      // Show undo notification
      setDeletedCompany(companyToDelete)
      setShowUndo(true)
      setTimeout(() => setShowUndo(false), 30000) // 30 seconds
      
      // Reload companies
      loadCompanies()
      
      // Close modal
      setShowDeleteModal(false)
      setCompanyToDelete(null)
      setDeleteConfirmation('')
    } catch (error) {
      console.error('Error deleting company:', error)
      // You could add a toast notification here
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUndoDelete = async () => {
    if (!deletedCompany) return
    
    try {
      await db.companies.restoreCompany(deletedCompany.id)
      setShowUndo(false)
      setDeletedCompany(null)
      loadCompanies()
    } catch (error) {
      console.error('Error restoring company:', error)
    }
  }

  const handleRestoreCompany = async (company: Company) => {
    try {
      await db.companies.restoreCompany(company.id)
      // Reload both active and deleted companies
      loadCompanies()
      loadDeletedCompanies()
    } catch (error) {
      console.error('Error restoring company:', error)
    }
  }

  const getPlanBadge = (plan: string) => {
    const planClasses = {
      basic: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-200 text-green-900'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planClasses[plan as keyof typeof planClasses] || planClasses.basic}`}>
        {plan || 'basic'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage company accounts and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + (c.max_users || 5), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Premium Plans</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.subscription_plan === 'premium').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Enterprise Plans</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.subscription_plan === 'enterprise').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Companies ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deleted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recently Deleted ({deletedCompanies.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="relative" ref={planDropdownRef}>
            <button
              type="button"
              onClick={() => setShowPlanDropdown(!showPlanDropdown)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between min-w-[140px]"
            >
              <span className="text-gray-900">
                {planFilter === 'all' ? 'All Plans' : 
                 planFilter === 'basic' ? 'Basic' :
                 planFilter === 'premium' ? 'Premium' : 'Enterprise'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPlanDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showPlanDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                {[
                  { value: 'all', label: 'All Plans' },
                  { value: 'basic', label: 'Basic' },
                  { value: 'premium', label: 'Premium' },
                  { value: 'enterprise', label: 'Enterprise' }
                ].map((option, index, array) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPlanFilter(option.value)
                      setShowPlanDropdown(false)
                    }}
                    className={getDropdownOptionClass(planFilter === option.value, index === 0, index === array.length - 1)}
                  >
                    <span>{option.label}</span>
                    {planFilter === option.value && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCompanies.map((company) => (
            <div 
              key={company.id} 
              className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">ID: {company.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPlanBadge(company.subscription_plan || 'basic')}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Max Users: {company.max_users || 5}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    Plan: {company.subscription_plan || 'basic'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteCompany(company)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deleted Companies Grid */}
      {activeTab === 'deleted' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {deletedCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg border border-red-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">ID: {company.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Deleted
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Max Users: {company.max_users || 5}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    Plan: {company.subscription_plan || 'basic'}
                  </div>
                  <div className="flex items-center text-sm text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deleted: {company.deleted_at ? new Date(company.deleted_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestoreCompany(company)}
                      className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                      title="Restore Company"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No companies found */}
      {((activeTab === 'active' && filteredCompanies.length === 0) || (activeTab === 'deleted' && deletedCompanies.length === 0)) && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' ? 'No companies found' : 'No deleted companies found'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'active' ? 'Try adjusting your search or filters.' : 'Deleted companies will appear here for 30 days.'}
          </p>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Company</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Company Name *"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="input w-full"
                required
              />
              <select
                value={newCompany.subscription_plan}
                onChange={(e) => setNewCompany({ ...newCompany, subscription_plan: e.target.value })}
                className="input w-full"
              >
                <option value="basic">Basic (default)</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <input
                type="number"
                placeholder="Max Users (default: 5)"
                value={newCompany.max_users}
                onChange={(e) => setNewCompany({ ...newCompany, max_users: parseInt(e.target.value) || 5 })}
                className="input w-full"
                min="1"
              />
              <p className="text-xs text-gray-500">
                * Company name is required. Subscription plan and max users will use defaults if not specified.
              </p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!newCompany.name.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Create Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      {showDeleteModal && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Company</h3>
                <p className="text-sm text-gray-500">This action can be undone within 30 days</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Warning</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This will delete the company "{companyToDelete.name}" and all associated users. 
                    The company will be moved to a "Recently Deleted" section for 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type the company name to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={companyToDelete.name}
                className="input w-full"
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setCompanyToDelete(null)
                  setDeleteConfirmation('')
                }}
                className="btn-secondary flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCompany}
                disabled={deleteConfirmation !== companyToDelete.name || isDeleting}
                className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Notification */}
      {showUndo && deletedCompany && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4">
          <div className="flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            <span>Company "{deletedCompany.name}" deleted</span>
          </div>
          <button
            onClick={handleUndoDelete}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
          >
            Undo
          </button>
          <button
            onClick={() => setShowUndo(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default Companies
