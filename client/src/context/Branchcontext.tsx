// File: src/context/BranchContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface Theater {
  id: number
  name: string
  address: string
  city: string
}

interface BranchContextType {
  theaters:        Theater[]
  selectedTheater: Theater | null
  selectTheater:   (t: Theater) => void
  loading:         boolean
}

const BranchContext = createContext<BranchContextType>({
  theaters:        [],
  selectedTheater: null,
  selectTheater:   () => {},
  loading:         true,
})

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`

export function BranchProvider({ children }: { children: ReactNode }) {
  const [theaters,        setTheaters]        = useState<Theater[]>([])
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const res  = await fetch(`${API_URL}/theaters`)
        const data = await res.json()
        if (!data.success) return
        setTheaters(data.theaters)

        // Restore from localStorage
        const savedId = localStorage.getItem("selectedTheaterId")
        if (savedId) {
          const found = data.theaters.find((t: Theater) => t.id === parseInt(savedId))
          if (found) { setSelectedTheater(found); return }
        }
        // Default to first
        if (data.theaters.length > 0) setSelectedTheater(data.theaters[0])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchTheaters()
  }, [])

  const selectTheater = (t: Theater) => {
    setSelectedTheater(t)
    localStorage.setItem("selectedTheaterId", String(t.id))
  }

  return (
    <BranchContext.Provider value={{ theaters, selectedTheater, selectTheater, loading }}>
      {children}
    </BranchContext.Provider>
  )
}

export const useBranch = () => useContext(BranchContext)