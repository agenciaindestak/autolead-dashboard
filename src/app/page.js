'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => { router.push('/dashboard') }, [router])
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ color:'var(--accent2)', fontSize:'18px' }}>Carregando AutoLead...</div>
    </div>
  )
}
