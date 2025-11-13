import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Monitor, 
  BarChart3, 
  HelpCircle, 
  Settings,
  LogOut,
  User,
  ChevronDown,
  Target,
  ScreenShare,
  Package
} from 'lucide-react'
import { staffAuth } from '../lib/staffAuth'

interface SidebarProps {
  user: any
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Smart Advertising', href: '/smart-advertising', icon: Target },
    { name: 'Desktop App', href: '/desktop-app', icon: Monitor },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'Screen Sharing', href: '/screen-sharing', icon: ScreenShare },
    { name: 'Apps', href: '/apps', icon: Package },
    { name: 'Admin', href: '/admin', icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      await staffAuth.logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg viewBox="0 0 1695.17 474.35" style={{ height: '32px', width: 'auto' }}>
            <defs>
              <style>{`
                .cls-1 {
                  fill: #000;
                }
                .cls-2 {
                  fill: #0ab27c;
                }
              `}</style>
            </defs>
            <g>
              <rect className="cls-2" x="148.69" y="175.36" width="23.87" height="37.04"/>
              <path className="cls-2" d="M250.64,92.09v120.3h-52.87v-43.2c0-4.8-1.85-8.9-5.56-12.31-3.65-3.35-8-5.03-13.06-5.03h-37.07c-5.05,0-9.4,1.68-13.06,5.03-3.7,3.41-5.55,7.51-5.55,12.31v43.2h-52.88v-120.3c0-10.31,8.36-18.68,18.69-18.68h142.69c10.32,0,18.68,8.36,18.68,18.68Z"/>
              <rect className="cls-2" x="148.69" y="218.32" width="23.87" height="37.04"/>
              <path className="cls-2" d="M250.64,218.32v120.3c0,10.32-8.35,18.69-18.68,18.69H89.28c-10.32,0-18.69-8.36-18.69-18.69v-120.3h52.88v43.19c0,4.81,1.85,8.91,5.55,12.31,3.65,3.35,8.01,5.03,13.06,5.03h37.07c5.06,0,9.4-1.68,13.06-5.03,3.71-3.4,5.56-7.5,5.56-12.31v-43.19h52.87Z"/>
              <polygon className="cls-2" points="339.54 197.05 343.42 212.4 339.54 212.4 339.54 197.05"/>
              <path className="cls-2" d="M444.76,92.09v120.3h-49.61v-60.53h-25.22v60.53h-5.43l-15.2-60.53h-34.97v60.53h-49.62v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
              <polygon className="cls-2" points="369.93 234.04 365.98 218.32 369.93 218.32 369.93 234.04"/>
              <path className="cls-2" d="M444.76,218.32v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h49.62v60.52h25.22v-60.52h5.38l15.32,60.52h34.9v-60.52h49.61Z"/>
            </g>
            <g>
              <path className="cls-1" d="M637.05,92.09v120.3h-77.43v-37.04h24.54v-23.49h-74.29v23.49h24.62v37.04h-77.5v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.69,8.36,18.69,18.68Z"/>
              <path className="cls-1" d="M637.05,218.32v120.3c0,10.32-8.37,18.69-18.69,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.5v60.52h25.14v-60.52h77.43Z"/>
              <path className="cls-1" d="M831.16,92.09v120.3h-77.42v-60.53h-25.21v60.53h-77.42v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
              <path className="cls-1" d="M831.16,218.32v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.42v60.52h25.21v-60.52h77.42Z"/>
              <polygon className="cls-1" points="964.58 212.4 968.19 195.17 968.19 212.4 964.58 212.4"/>
              <polygon className="cls-1" points="902.31 195.17 905.95 212.4 902.31 212.4 902.31 195.17"/>
              <path className="cls-1" d="M1025.27,92.09v120.3h-31.87v-60.53h-34.97l-13.55,60.53h-19.17l-13.65-60.53h-34.97v60.53h-31.87v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
              <polygon className="cls-1" points="935.33 255.06 927.04 218.32 943.55 218.32 935.33 255.06"/>
              <path className="cls-1" d="M1025.27,218.32v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h31.87v60.52h25.22v-60.52h4.9l12.81,60.52h30.62l12.7-60.52h4.86v60.52h25.22v-60.52h31.87Z"/>
              <path className="cls-1" d="M1219.39,92.09v120.3h-63.46v-8.82h-34.97v-28.21h42.03v-23.49h-67.25v60.53h-56.4v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
              <path className="cls-1" d="M1219.39,218.32v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h56.4v60.52h67.25v-23.49h-42.03v-28.21h34.97v-8.82h63.46Z"/>
              <path className="cls-1" d="M1413.5,92.09v120.3h-94.9v-60.53h-25.22v60.53h-59.93v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
              <path className="cls-1" d="M1413.5,218.32v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h59.93v60.52h60.19v-23.49h-34.97v-37.04h94.9Z"/>
              <path className="cls-1" d="M1607.62,92.09v120.3h-70.11l19.14-60.53h-25.74c-3.64,12.33-8.08,32.5-13.31,60.53h-.09c-5.13-28.03-9.55-48.21-13.24-60.53h-25.74l19.18,60.53h-70.15v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
              <path className="cls-1" d="M1607.62,218.32v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h72.02l5.43,17.15v43.37h25.22v-43.45l5.4-17.07h71.98Z"/>
            </g>
            <g>
              <path className="cls-1" d="M1640.53,338.37c-5.22,0-9.46,4.25-9.46,9.46s4.25,9.46,9.46,9.46,9.46-4.25,9.46-9.46-4.25-9.46-9.46-9.46ZM1640.53,356.06c-4.53,0-8.22-3.69-8.22-8.22s3.69-8.22,8.22-8.22,8.22,3.69,8.22,8.22-3.69,8.22-8.22,8.22Z"/>
              <path className="cls-1" d="M1640.77,350.94c-2.33,0-3.23-1.63-3.24-3.19-.01-1.57.97-3.27,3.24-3.27.82,0,1.65.28,2.27.89l1.18-1.14c-.97-.95-2.18-1.44-3.46-1.44-3.4,0-5,2.5-4.99,4.96.01,2.45,1.49,4.85,4.99,4.85,1.36,0,2.61-.44,3.58-1.4l-1.21-1.22c-.62.62-1.55.95-2.37.95Z"/>
            </g>
            <g>
              <path className="cls-1" d="M482.87,437.87h20.84v11.63h-33.34v-62.95h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v14.02Z"/>
              <path className="cls-1" d="M537.16,386.56h12.69l-12.18,62.95h-16.61l-12.22-62.95h12.65c2.27,11.54,4.88,28.53,7.83,50.96,2.98-22.46,5.59-39.45,7.83-50.96Z"/>
              <path className="cls-1" d="M569.4,437.87h20.84v11.63h-33.34v-62.95h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v14.02Z"/>
              <path className="cls-1" d="M611.9,408.96v40.54h-12.5v-62.95h17.35l10.22,40.74v-40.74h12.5v62.95h-17.31l-10.26-40.54Z"/>
              <path className="cls-1" d="M659.49,398.19h-12.22v-11.63h36.86v11.63h-12.18v51.32h-12.46v-51.32Z"/>
              <path className="cls-1" d="M767.73,386.56v62.95h-12.54v-41.48l-8.7,41.48h-15.2l-8.77-41.48v41.48h-12.5v-62.95h17.35l11.52,51.16,11.48-51.16h17.35Z"/>
              <path className="cls-1" d="M791.35,436.74l-2.55,12.77h-12.65l12.22-62.95h16.61l12.18,62.95h-12.69l-2.47-12.77h-10.65ZM793.62,425.1h6.07l-3.06-26.83-3.02,26.83Z"/>
              <path className="cls-1" d="M836.94,408.96v40.54h-12.5v-62.95h17.35l10.22,40.74v-40.74h12.5v62.95h-17.31l-10.26-40.54Z"/>
              <path className="cls-1" d="M888.18,436.74l-2.55,12.77h-12.65l12.22-62.95h16.61l12.18,62.95h-12.69l-2.47-12.77h-10.65ZM890.45,425.1h6.07l-3.06-26.83-3.02,26.83Z"/>
              <path className="cls-1" d="M944.98,427.06h-5.92v-11.63h18.45v25.5c0,2.38-.93,4.4-2.78,6.07-1.8,1.67-3.96,2.51-6.46,2.51h-18.37c-2.51,0-4.67-.84-6.5-2.51-1.83-1.67-2.74-3.7-2.74-6.07v-45.79c0-2.38.91-4.41,2.74-6.11,1.83-1.65,4-2.47,6.5-2.47h18.37c2.51,0,4.66.82,6.46,2.47,1.85,1.7,2.78,3.73,2.78,6.11v12.65h-12.54v-9.6h-11.83v39.68h11.83v-10.81Z"/>
              <path className="cls-1" d="M981.1,437.87h20.84v11.63h-33.34v-62.95h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v14.02Z"/>
              <path className="cls-1" d="M1068.8,386.56v62.95h-12.54v-41.48l-8.7,41.48h-15.2l-8.77-41.48v41.48h-12.5v-62.95h17.35l11.52,51.16,11.48-51.16h17.35Z"/>
              <path className="cls-1" d="M1093.64,437.87h20.84v11.63h-33.34v-62.95h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v14.02Z"/>
              <path className="cls-1" d="M1136.14,408.96v40.54h-12.5v-62.95h17.35l10.22,40.74v-40.74h12.5v62.95h-17.31l-10.26-40.54Z"/>
              <path className="cls-1" d="M1183.74,398.19h-12.22v-11.63h36.86v11.63h-12.18v51.32h-12.46v-51.32Z"/>
              <path className="cls-1" d="M1257.65,398.19h-11.83v9.95c0,2.69,1.97,4.03,5.92,4.03,5.17,0,9.48,1.38,12.93,4.15,3.68,2.92,5.52,6.79,5.52,11.59v13.01c0,2.38-.93,4.4-2.78,6.07-1.8,1.67-3.96,2.51-6.46,2.51h-18.37c-2.51,0-4.67-.84-6.5-2.51-1.83-1.67-2.74-3.7-2.74-6.07v-12.69h12.5v9.64h11.83v-9.95c0-2.72-1.97-4.07-5.92-4.07-5.15,0-9.44-1.37-12.89-4.11-3.68-2.92-5.52-6.79-5.52-11.59v-13.01c0-2.38.91-4.41,2.74-6.11,1.83-1.65,4-2.47,6.5-2.47h18.37c2.51,0,4.66.82,6.46,2.47,1.85,1.7,2.78,3.73,2.78,6.11v12.65h-12.53v-9.6Z"/>
              <path className="cls-1" d="M1308.03,386.56c2.51,0,4.66.82,6.46,2.47,1.85,1.7,2.78,3.73,2.78,6.11v45.79c0,2.38-.93,4.4-2.78,6.07-1.8,1.67-3.96,2.51-6.46,2.51h-18.37c-2.51,0-4.67-.84-6.5-2.51-1.83-1.67-2.74-3.7-2.74-6.07v-45.79c0-2.38.91-4.41,2.74-6.11,1.83-1.65,4-2.47,6.5-2.47h18.37ZM1292.91,398.19v39.68h11.83v-39.68h-11.83Z"/>
              <path className="cls-1" d="M1329.34,386.56h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v25.66h-12.5v-62.95Z"/>
              <path className="cls-1" d="M1377.4,398.19h-12.22v-11.63h36.86v11.63h-12.18v51.32h-12.46v-51.32Z"/>
              <path className="cls-1" d="M1431.27,386.56h15.86l7.64,51.2c2.51-22.67,4.74-39.73,6.7-51.2h12.65l-10.73,62.95h-16.73l-7.44-45.32-7.44,45.32h-16.69l-10.81-62.95h12.65c1.96,11.46,4.19,28.53,6.7,51.2l7.64-51.2Z"/>
              <path className="cls-1" d="M1488.77,436.74l-2.55,12.77h-12.65l12.22-62.95h16.61l12.18,62.95h-12.69l-2.47-12.77h-10.65ZM1491.04,425.1h6.07l-3.06-26.83-3.02,26.83Z"/>
              <path className="cls-1" d="M1534.37,427.06v22.45h-12.5v-62.95h27.62c2.51,0,4.66.82,6.46,2.47,1.85,1.7,2.78,3.73,2.78,6.11v16.22c0,4.13-1.61,7.42-4.82,9.87,3.21,2.46,4.82,5.77,4.82,9.95v18.33h-12.54v-18.33c0-1.15-.44-2.13-1.33-2.94-.89-.78-1.93-1.18-3.13-1.18h-7.36ZM1541.73,415.43c1.2,0,2.25-.4,3.13-1.21.89-.76,1.33-1.71,1.33-2.86v-13.16h-11.83v17.24h7.36Z"/>
              <path className="cls-1" d="M1583.1,437.87h20.84v11.63h-33.34v-62.95h33.34v11.63h-20.84v13.98h17.35v11.67h-17.35v14.02Z"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Staff Member'}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role || 'staff'}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
              isUserMenuOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
