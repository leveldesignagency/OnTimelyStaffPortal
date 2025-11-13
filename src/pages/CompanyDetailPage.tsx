import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Edit, Save, Trash2, X, ChevronDown } from 'lucide-react'
import { db } from '@/lib/database'
import { Company } from '@/lib/supabase'

interface CompanyUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit states
  const [editingCompanyName, setEditingCompanyName] = useState(false)
  const [companyNameValue, setCompanyNameValue] = useState('')
  const [editingUserRole, setEditingUserRole] = useState<string | null>(null)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadCompanyData()
    }
  }, [id])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      
      // Load company data
      const companyData = await db.companies.getCompany(id!)
      if (companyData) {
        setCompany(companyData)
        setCompanyNameValue(companyData.name)
      }
      
      // Load company users
      const companyUsers = await db.users.getUsersByCompany(id!)
      // Map User[] to CompanyUser[] with proper type handling
      const mappedUsers: CompanyUser[] = companyUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'offline',
        created_at: user.created_at
      }))
      setUsers(mappedUsers)
    } catch (error) {
      console.error('Error loading company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompanyName = async () => {
    if (!company || !companyNameValue.trim()) return
    
    try {
      await db.companies.updateCompany(company.id, { name: companyNameValue })
      setCompany({ ...company, name: companyNameValue })
      setEditingCompanyName(false)
    } catch (error) {
      console.error('Error updating company name:', error)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await db.users.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingUserRole(null)
      setRoleDropdownOpen(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await db.users.deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Company not found</p>
        <button onClick={() => navigate('/companies')} className="btn-primary mt-4">
          Back to Companies
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/companies')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="w-10 h-10 text-green-600 mr-4" />
            <div>
              {editingCompanyName ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={companyNameValue}
                    onChange={(e) => setCompanyNameValue(e.target.value)}
                    className="text-2xl font-bold border border-gray-300 rounded px-2 py-1 mr-2"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCompanyName}
                    className="text-green-600 hover:text-green-800 mr-2"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCompanyName(false)
                      setCompanyNameValue(company.name)
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <button
                    onClick={() => setEditingCompanyName(true)}
                    className="ml-3 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">ID: {company.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-2">
            <Building2 className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Subscription Plan</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{company.subscription_plan || 'basic'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Max Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{company.max_users || 5}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Current Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Company Users ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserRole === user.id ? (
                      <div className="relative">
                        <button
                          onClick={() => setRoleDropdownOpen(user.id)}
                          className="flex items-center text-sm px-2 py-1 border border-gray-300 rounded"
                        >
                          <span className="mr-2 capitalize">{user.role}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {roleDropdownOpen === user.id && (
                          <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg">
                            {['admin', 'manager', 'member'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleUpdateUserRole(user.id, role)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                <span className="capitalize">{role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editingUserRole !== user.id && (
                        <button
                          onClick={() => setEditingUserRole(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found for this company</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage

