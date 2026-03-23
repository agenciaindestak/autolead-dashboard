'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Car, MessageSquare, Settings } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads',     label: 'Leads',     icon: Users },
  { href: '/vehicles',  label: 'Veículos',  icon: Car },
  { href: '/chat',      label: 'Agente IA', icon: MessageSquare },
  { href: '/settings',  label: 'Config.',   icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px', minWidth: '220px', minHeight: '100vh',
      background: 'var(--card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>AL</span>
        </div>
        <div>
          <div style={{ color: 'var(--text)', fontWeight: '700', fontSize: '14px' }}>AutoLead</div>
          <div style={{ color: 'var(--muted2)', fontSize: '11px' }}>Painel Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/')
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
              fontWeight: active ? '600' : '400',
              color: active ? '#fff' : 'var(--muted)',
              background: active ? 'var(--accent)' : 'transparent',
              transition: 'all .15s',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { if(!active) e.currentTarget.style.background = 'var(--bg3)' }}
            onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(161,0,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'var(--accent2)', fontSize: '11px', fontWeight: '700' }}>AG</span>
        </div>
        <div>
          <div style={{ color: 'var(--text)', fontSize: '12px', fontWeight: '600' }}>AutoMais Veículos</div>
          <div style={{ color: 'var(--muted2)', fontSize: '10px' }}>Agência</div>
        </div>
      </div>
    </aside>
  )
}
