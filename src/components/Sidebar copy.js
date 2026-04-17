'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UserGroupIcon, 
  TruckIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const pathname = usePathname()
  
  const links = [
    { href: '/', label: 'Dashboard', icon: HomeIcon },
    { href: '/leads', label: 'Leads', icon: UserGroupIcon },
    { href: '/vehicles', label: 'Veículos', icon: TruckIcon },
    { href: '/agents', label: 'Agentes', icon: SparklesIcon },
    { href: '/conversations', label: 'Conversas', icon: ChatBubbleLeftRightIcon },
    { href: '/settings', label: 'Configurações', icon: Cog6ToothIcon },
  ]
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">AutoLead AI</h1>
        <p className="text-sm text-gray-500 mt-1">Atendimento Inteligente</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">AutoLead</p>
            <p className="text-xs text-gray-500">Versão 1.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}