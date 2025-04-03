'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold text-blue-600">Retail Sales Tracker</span>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/stores" className="text-gray-700 hover:text-blue-600">
                Stores
              </Link>
              <Link href="/sales" className="text-gray-700 hover:text-blue-600">
                Sales
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}