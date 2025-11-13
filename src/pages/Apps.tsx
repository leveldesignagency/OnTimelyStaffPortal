import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Save, X, Upload, Mail, FileText, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface App {
  id: string
  app_key: string
  app_name: string
  short_description: string
  full_description: string | null
  app_type: 'service' | 'tool' | 'file' | 'field'
  icon_name: string | null
  image_url: string | null
  version: string
  developer_name: string | null
  developer_email: string | null
  is_active: boolean
  is_featured: boolean
  features: string[]
  build_instructions: {
    npm_packages?: string[]
    pods?: string[]
    gradle_dependencies?: string[]
    build_commands?: string[]
    requirements?: string
  }
  mobile_integration_config: {
    entry_point?: string
    module_name?: string
    permissions?: string[]
  }
  created_at: string
  updated_at: string
}

const Apps: React.FC = () => {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [appToDelete, setAppToDelete] = useState<App | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Send documents modal state
  const [showSendDocumentsModal, setShowSendDocumentsModal] = useState(false)
  const [developerEmail, setDeveloperEmail] = useState('')
  const [developerName, setDeveloperName] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState({
    developerGuide: true,
    submissionForm: true,
    backgroundTemplate: true
  })
  const [isSendingDocuments, setIsSendingDocuments] = useState(false)
  
  const [formData, setFormData] = useState<Partial<App>>({
    app_key: '',
    app_name: '',
    short_description: '',
    full_description: '',
    app_type: 'service',
    icon_name: '',
    image_url: '',
    version: '1.0.0',
    developer_name: '',
    developer_email: '',
    is_active: true,
    is_featured: false,
    features: [],
    build_instructions: {},
    mobile_integration_config: {}
  })

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('available_apps')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('app_name', { ascending: true })

      if (error) throw error

      // Parse JSONB fields
      const parsedApps = (data || []).map(app => ({
        ...app,
        features: Array.isArray(app.features) ? app.features : [],
        build_instructions: app.build_instructions || {},
        mobile_integration_config: app.mobile_integration_config || {}
      }))

      setApps(parsedApps as App[])
    } catch (error: any) {
      console.error('Error fetching apps:', error)
      toast.error('Failed to load apps')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.app_key || 'app'}-${Date.now()}.${fileExt}`
      const filePath = `app-images/${fileName}`

      // For local development, try API endpoint first, fallback to direct upload if it fails
      // In production, always use API endpoint
      if (import.meta.env.DEV) {
        try {
          // Try API endpoint first
          const reader = new FileReader()
          const base64File = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string
              resolve(result)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })

          const response = await fetch('/api/upload-app-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64File,
              fileName: fileName,
              fileType: file.type
            })
          })

          if (response.ok) {
            const { url } = await response.json()
            setFormData({ ...formData, image_url: url })
            setImagePreview(url)
            toast.success('Image uploaded successfully')
            return
          }
        } catch (apiError) {
          console.warn('API endpoint failed, trying direct upload:', apiError)
          // Fall through to direct upload
        }

        // Fallback: Direct upload using service role (dev only)
        // Import supabaseAdmin from lib
        const { supabaseAdmin } = await import('../lib/supabase')
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('app-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('app-images')
          .getPublicUrl(filePath)

        setFormData({ ...formData, image_url: publicUrl })
        setImagePreview(publicUrl)
        toast.success('Image uploaded successfully')
      } else {
        // Production: Always use API endpoint
        const reader = new FileReader()
        const base64File = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const response = await fetch('/api/upload-app-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64File,
            fileName: fileName,
            fileType: file.type
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const { url } = await response.json()

        setFormData({ ...formData, image_url: url })
        setImagePreview(url)
        toast.success('Image uploaded successfully')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      handleImageUpload(file)
    }
  }

  const handleToggleActive = async (app: App) => {
    try {
      const { error } = await supabase
        .from('available_apps')
        .update({ is_active: !app.is_active })
        .eq('id', app.id)

      if (error) throw error

      toast.success(`App ${!app.is_active ? 'activated' : 'deactivated'}`)
      fetchApps()
    } catch (error: any) {
      console.error('Error toggling app:', error)
      toast.error('Failed to update app')
    }
  }

  const handleToggleFeatured = async (app: App) => {
    try {
      const { error } = await supabase
        .from('available_apps')
        .update({ is_featured: !app.is_featured })
        .eq('id', app.id)

      if (error) throw error

      toast.success(`App ${!app.is_featured ? 'featured' : 'unfeatured'}`)
      fetchApps()
    } catch (error: any) {
      console.error('Error toggling featured:', error)
      toast.error('Failed to update app')
    }
  }

  const handleDeleteClick = (app: App) => {
    setAppToDelete(app)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('available_apps')
        .delete()
        .eq('id', appToDelete.id)

      if (error) throw error

      toast.success('App deleted successfully')
      setShowDeleteModal(false)
      setAppToDelete(null)
      fetchApps()
    } catch (error: any) {
      console.error('Error deleting app:', error)
      toast.error('Failed to delete app')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (app: App) => {
    setSelectedApp(app)
    setFormData({
      app_key: app.app_key,
      app_name: app.app_name,
      short_description: app.short_description,
      full_description: app.full_description || '',
      app_type: app.app_type,
      icon_name: app.icon_name || '',
      image_url: app.image_url || '',
      version: app.version,
      developer_name: app.developer_name || '',
      developer_email: app.developer_email || '',
      is_active: app.is_active,
      is_featured: app.is_featured,
      features: app.features,
      build_instructions: app.build_instructions,
      mobile_integration_config: app.mobile_integration_config
    })
    setImagePreview(app.image_url)
    setShowEditModal(true)
  }

  const handleAdd = () => {
    setSelectedApp(null)
    setFormData({
      app_key: '',
      app_name: '',
      short_description: '',
      full_description: '',
      app_type: 'service',
      icon_name: '',
      image_url: '',
      version: '1.0.0',
      developer_name: '',
      developer_email: '',
      is_active: true,
      is_featured: false,
      features: [],
      build_instructions: {},
      mobile_integration_config: {}
    })
    setImagePreview(null)
    setShowAddModal(true)
  }

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.app_key || !formData.app_name || !formData.short_description) {
        toast.error('Please fill in all required fields')
        return
      }

      const appData = {
        ...formData,
        features: formData.features || [],
        build_instructions: formData.build_instructions || {},
        mobile_integration_config: formData.mobile_integration_config || {}
      }

      if (selectedApp) {
        // Update existing app
        const { error } = await supabase
          .from('available_apps')
          .update(appData)
          .eq('id', selectedApp.id)

        if (error) throw error
        toast.success('App updated successfully')
      } else {
        // Create new app
        const { error } = await supabase
          .from('available_apps')
          .insert([appData])

        if (error) throw error
        toast.success('App created successfully')
      }

      setShowAddModal(false)
      setShowEditModal(false)
      setSelectedApp(null)
      setImagePreview(null)
      fetchApps()
    } catch (error: any) {
      console.error('Error saving app:', error)
      toast.error(error.message || 'Failed to save app')
    }
  }

  const handleDownloadGuide = async () => {
    try {
      // Try to fetch from public folder first, then fallback to GitHub
      let text = ''
      try {
        const response = await fetch('/DEVELOPER_GUIDE.md')
        if (response.ok) {
          text = await response.text()
        } else {
          throw new Error('File not found locally')
        }
      } catch {
        // Fallback: Fetch from GitHub or use a direct link
        const githubUrl = 'https://raw.githubusercontent.com/ontimely/ontimely/main/DEVELOPER_GUIDE.md'
        const response = await fetch(githubUrl)
        if (response.ok) {
          text = await response.text()
        } else {
          // If GitHub fails, open in new tab
          window.open(githubUrl, '_blank')
          toast('Opening Developer Guide in new tab')
          return
        }
      }
      
      // Create downloadable blob
      const blob = new Blob([text], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'OnTimely-Developer-Guide.md'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Developer Guide downloaded')
    } catch (error) {
      console.error('Error downloading guide:', error)
      toast.error('Failed to download guide. Please try again.')
    }
  }

  const handleDownloadBackground = async () => {
    try {
      // Try to fetch from public folder first, then fallback to GitHub
      let blob: Blob | null = null
      try {
        const response = await fetch('/apps_background.png')
        if (response.ok) {
          blob = await response.blob()
        } else {
          throw new Error('File not found locally')
        }
      } catch {
        // Fallback: Fetch from GitHub
        const githubUrl = 'https://raw.githubusercontent.com/ontimely/ontimely/main/apps_background.png'
        const response = await fetch(githubUrl)
        if (response.ok) {
          blob = await response.blob()
        } else {
          // If GitHub fails, open in new tab
          window.open(githubUrl, '_blank')
          toast('Opening background template in new tab')
          return
        }
      }
      
      // Create downloadable blob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'apps_background.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Background template downloaded')
    } catch (error) {
      console.error('Error downloading background:', error)
      toast.error('Failed to download background. Please try again.')
    }
  }

  const handleDownloadForm = async () => {
    try {
      // Try to fetch from public folder first, then fallback to GitHub
      let text = ''
      try {
        const response = await fetch('/APP_SUBMISSION_FORM.md')
        if (response.ok) {
          text = await response.text()
        } else {
          throw new Error('File not found locally')
        }
      } catch {
        // Fallback: Fetch from GitHub or use a direct link
        const githubUrl = 'https://raw.githubusercontent.com/ontimely/ontimely/main/APP_SUBMISSION_FORM.md'
        const response = await fetch(githubUrl)
        if (response.ok) {
          text = await response.text()
        } else {
          // If GitHub fails, open in new tab
          window.open(githubUrl, '_blank')
          toast('Opening Submission Form in new tab')
          return
        }
      }
      
      // Create downloadable blob
      const blob = new Blob([text], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'OnTimely-App-Submission-Form.md'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Submission Form downloaded')
    } catch (error) {
      console.error('Error downloading form:', error)
      toast.error('Failed to download form. Please try again.')
    }
  }

  const handleSendDocuments = async () => {
    if (!developerEmail || !developerEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!selectedDocuments.developerGuide && !selectedDocuments.submissionForm && !selectedDocuments.backgroundTemplate) {
      toast.error('Please select at least one document to send')
      return
    }

    try {
      setIsSendingDocuments(true)

      // Prepare email content
      const documents = []
      if (selectedDocuments.developerGuide) {
        documents.push('Developer Guide')
      }
      if (selectedDocuments.submissionForm) {
        documents.push('App Submission Form')
      }
      if (selectedDocuments.backgroundTemplate) {
        documents.push('App Background Template')
      }

      // Send email via API (with fallback to mailto)
      const apiUrl = import.meta.env.VITE_API_URL || ''
      
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/api/send-developer-documents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: developerEmail,
              developerName: developerName || 'Developer',
              documents: documents,
              developerGuide: selectedDocuments.developerGuide,
              submissionForm: selectedDocuments.submissionForm,
              backgroundTemplate: selectedDocuments.backgroundTemplate
            })
          })

          if (!response.ok) {
            throw new Error('Failed to send email')
          }

          toast.success(`Documents sent successfully to ${developerEmail}`)
          setShowSendDocumentsModal(false)
          setDeveloperEmail('')
          setDeveloperName('')
          setSelectedDocuments({ developerGuide: true, submissionForm: true, backgroundTemplate: true })
          return
        } catch (apiError) {
          console.warn('API email failed, using mailto fallback:', apiError)
        }
      }
      
      // Fallback: Open email client with pre-filled content
      const subject = encodeURIComponent('OnTimely Developer Documents')
      const guideUrl = 'https://docs.ontimely.co.uk/developer-guide'
      const formUrl = 'https://docs.ontimely.co.uk/submission-form'
      const backgroundUrl = 'https://raw.githubusercontent.com/ontimely/ontimely/main/apps_background.png'
      
      let body = `Hi ${developerName || 'Developer'},

Thank you for your interest in developing apps for OnTimely!

Please find the requested documents below:

${selectedDocuments.developerGuide ? `- Developer Guide: ${guideUrl}` : ''}
${selectedDocuments.submissionForm ? `- App Submission Form: ${formUrl}` : ''}
${selectedDocuments.backgroundTemplate ? `- App Background Template: ${backgroundUrl}` : ''}

${selectedDocuments.backgroundTemplate ? `
IMPORTANT: All app images must use the OnTimely background template (apps_background.png).
Your app icon/content should be placed on top of this background to ensure visual consistency.
` : ''}

Next Steps:
1. Review the Developer Guide
${selectedDocuments.backgroundTemplate ? '2. Download the App Background Template (if not already included)\n' : ''}${selectedDocuments.submissionForm ? `${selectedDocuments.backgroundTemplate ? '3' : '2'}. Fill out the App Submission Form` : ''}
${selectedDocuments.submissionForm ? `${selectedDocuments.backgroundTemplate ? '4' : '3'}. Submit your completed form to developers@ontimely.co.uk` : ''}
${selectedDocuments.submissionForm ? `${selectedDocuments.backgroundTemplate ? '5' : '4'}. Our team will review your submission within 5-7 business days` : ''}

If you have any questions, please contact developers@ontimely.co.uk

Best regards,
The OnTimely Team`
      
      body = encodeURIComponent(body)
      window.location.href = `mailto:${developerEmail}?subject=${subject}&body=${body}`
      
      toast.success('Email client opened. Please send the email manually.')
      setShowSendDocumentsModal(false)
      setDeveloperEmail('')
      setDeveloperName('')
      setSelectedDocuments({ developerGuide: true, submissionForm: true, backgroundTemplate: true })
    } catch (error: any) {
      console.error('Error sending documents:', error)
      toast.error(error.message || 'Failed to send documents. Please try again.')
    } finally {
      setIsSendingDocuments(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apps Management</h1>
          <p className="text-gray-600 mt-2">Manage available apps and add-ons for OnTimely users</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Download Developer Documents */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadGuide}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title="Download Developer Guide"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Guide</span>
            </button>
            <button
              onClick={handleDownloadForm}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title="Download Submission Form"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Form</span>
            </button>
            <button
              onClick={handleDownloadBackground}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title="Download App Background Template"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden md:inline">Background</span>
            </button>
          </div>
          
          {/* Send Documents to Developer */}
          <button
            onClick={() => setShowSendDocumentsModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>Send to Developer</span>
          </button>
          
          {/* Add New App */}
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add New App</span>
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`bg-white rounded-lg shadow-md border-2 p-6 ${
              app.is_featured ? 'border-yellow-400' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900">{app.app_name}</h3>
                  {app.is_featured && (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{app.app_key}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleFeatured(app)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={app.is_featured ? 'Unfeature' : 'Feature'}
                >
                  {app.is_featured ? (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleToggleActive(app)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={app.is_active ? 'Deactivate' : 'Activate'}
                >
                  {app.is_active ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{app.short_description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {app.app_type}
              </span>
              <span className="text-sm text-gray-500">v{app.version}</span>
            </div>

            {app.features && app.features.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {app.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                  {app.features.length > 3 && (
                    <li className="text-gray-400">+{app.features.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(app)}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteClick(app)}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors px-4"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No apps found</p>
          <button
            onClick={handleAdd}
            className="mt-4 text-green-600 hover:text-green-700 font-semibold"
          >
            Add your first app
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete App</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{appToDelete.app_name}"</span>? 
              This will remove it from all events where it's currently enabled.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setAppToDelete(null)
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal - Full View */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          {/* Sidebar stays visible */}
          <div className="w-64"></div>
          
          {/* Modal Content */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedApp ? 'Edit App' : 'Add New App'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedApp(null)
                  setImagePreview(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 max-w-4xl mx-auto space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Key * (unique identifier)
                    </label>
                    <input
                      type="text"
                      value={formData.app_key || ''}
                      onChange={(e) => setFormData({ ...formData, app_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="flightTracker"
                      disabled={!!selectedApp}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Name *
                    </label>
                    <input
                      type="text"
                      value={formData.app_name || ''}
                      onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Flight Tracker"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    value={formData.short_description || ''}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Real-time flight status tracking"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    value={formData.full_description || ''}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Detailed description of the app..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Type *
                    </label>
                    <select
                      value={formData.app_type || 'service'}
                      onChange={(e) => setFormData({ ...formData, app_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="service">Service</option>
                      <option value="tool">Tool</option>
                      <option value="file">File</option>
                      <option value="field">Field</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version || '1.0.0'}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={formData.icon_name || ''}
                      onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="airplane"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">App Image</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image_url || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value })
                        setImagePreview(e.target.value)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="/images/flighttracker.jpg or https://..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter image URL or upload a file below</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          <span className="text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">Choose Image</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/GIF</p>
                  </div>
                </div>

                {/* Image Preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={imagePreview || formData.image_url || ''}
                        alt="App preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePreview(null)
                          toast.error('Failed to load image')
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This image will appear in the desktop app when users view app details
                    </p>
                  </div>
                )}
              </div>

              {/* Developer Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Developer Name
                    </label>
                    <input
                      type="text"
                      value={formData.developer_name || ''}
                      onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="OnTimely"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Developer Email
                    </label>
                    <input
                      type="email"
                      value={formData.developer_email || ''}
                      onChange={(e) => setFormData({ ...formData, developer_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="developer@ontimely.co.uk"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <textarea
                  value={(formData.features || []).join('\n')}
                  onChange={(e) => {
                    const features = e.target.value.split('\n').filter(f => f.trim())
                    setFormData({ ...formData, features })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={5}
                  placeholder="Enter features, one per line..."
                />
                <p className="text-sm text-gray-500 mt-2">Enter one feature per line</p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedApp(null)
                    setImagePreview(null)
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Documents to Developer Modal */}
      {showSendDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Send Documents to Developer</h2>
              <button
                onClick={() => {
                  setShowSendDocumentsModal(false)
                  setDeveloperEmail('')
                  setDeveloperName('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Developer Name
                </label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Developer Email *
                </label>
                <input
                  type="email"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="developer@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Documents to Send
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.developerGuide}
                      onChange={(e) => setSelectedDocuments({
                        ...selectedDocuments,
                        developerGuide: e.target.checked
                      })}
                      className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Developer Guide
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.submissionForm}
                      onChange={(e) => setSelectedDocuments({
                        ...selectedDocuments,
                        submissionForm: e.target.checked
                      })}
                      className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      App Submission Form
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.backgroundTemplate}
                      onChange={(e) =>
                        setSelectedDocuments({
                          ...selectedDocuments,
                          backgroundTemplate: e.target.checked
                        })}
                      className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      App Background Template (REQUIRED for all app images)
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  An email will be sent to the developer with links to download the selected documents and instructions on how to submit their app.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSendDocumentsModal(false)
                  setDeveloperEmail('')
                  setDeveloperName('')
                }}
                disabled={isSendingDocuments}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDocuments}
                disabled={isSendingDocuments || !developerEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSendingDocuments ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Apps
