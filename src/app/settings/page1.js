'use client'
import Sidebar from '@/components/Sidebar'
import { Settings, Building, Key } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400 mt-1">Gerencie sua agência e integrações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-400/10 p-2 rounded-lg">
                <Building className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-white font-semibold">Dados da Agência</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nome', value: 'AutoMais Veículos' },
                { label: 'Agency ID', value: '6ee07688-9d34-4d18-861c-62585a440cc0' },
                { label: 'Plano', value: 'MVP — Desenvolvimento' },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-gray-400 text-xs mb-1 block">{item.label}</label>
                  <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-700">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-400/10 p-2 rounded-lg">
                <Key className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-white font-semibold">Integrações</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Supabase', status: 'Conectado', color: 'text-green-400 bg-green-400/10' },
                { name: 'Groq IA', status: 'Conectado', color: 'text-green-400 bg-green-400/10' },
                { name: 'Railway', status: 'Online', color: 'text-green-400 bg-green-400/10' },
                { name: 'WhatsApp', status: 'Em breve', color: 'text-yellow-400 bg-yellow-400/10' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-white text-sm">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-400/10 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-white font-semibold">API Backend</h2>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-400 text-xs mb-2">URL de Produção</p>
              <p className="text-green-400">https://autolead-backend-production.up.railway.app</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}