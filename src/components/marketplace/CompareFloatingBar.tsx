'use client'
import { useCompare, useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { GitCompare, X } from 'lucide-react'

export default function CompareFloatingBar() {
  const { items, clearAll, itemCount } = useCompare()
  const { navigate } = useNavigation()
  const count = itemCount()

  if (count < 2) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-cm-elevated/95 backdrop-blur-xl border-t border-cm-border-hover shadow-2xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <GitCompare className="w-5 h-5 text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-cm-primary truncate">
              {count} product{count !== 1 ? 's' : ''} selected for comparison
            </p>
            <p className="text-xs text-cm-dim">Click to compare side by side</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="border-cm-border-hover text-cm-dim hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('compare')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs shadow-lg shadow-red-500/20"
          >
            <GitCompare className="w-3.5 h-3.5 mr-1.5" />
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  )
}
