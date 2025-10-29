import { useEffect, useState } from 'react'

type NavItem = {
  key: string
  label: string
  icon: string
  iconPath?: string
  children?: NavItem[]
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', iconPath: '/icons/dashboard.svg' },
  { key: 'calendar', label: 'Calendar', icon: '📅', iconPath: '/icons/calendar.svg' },
  { key: 'ugc', label: 'UGC', icon: '👥', iconPath: '/icons/UGC.svg' },
  {
    key: 'reputation',
    label: 'Reputation Management',
    icon: '🗨️',
    iconPath: '/icons/Reputation.svg',
    
  },
  { key: 'influencers', label: 'Influencer Management', icon: '⭐', iconPath: '/icons/posts.svg' },
  { key: 'ads', label: 'Ads', icon: '📣', iconPath: '/icons/ads.svg' },
  { key: 'assets', label: 'AI Asset Manager', icon: '🧠' },
]

interface Props {
  collapsed: boolean
  setCollapsed: (next: boolean) => void
  activeKey?: string
}

export default function Sidebar({ collapsed, setCollapsed, activeKey = 'inbox' }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ reputation: true })

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed))
    } catch {}
  }, [collapsed])

  const toggleGroup = (key: string) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }))

  return (
    <aside
      className={
        (collapsed ? 'w-16' : 'w-64') +
        ' shrink-0 h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col transition-[width] duration-200'
      }
    >
      <div className="flex h-14 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <img src="/icons/LogoInsignia.svg" alt="SoHo" className="h-7 w-7" />
          {!collapsed && <span className="text-sm font-semibold">SoHo</span>}
        </div>
        <button
          className="rounded-md border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const isGroup = !!item.children?.length
            const isOpen = openGroups[item.key]
            const isActive = item.key === activeKey
            return (
              <li key={item.key}>
                <button
                  className={
                    'relative w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 ' +
                    (isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 border-l-2 border-indigo-600'
                      : 'text-gray-700 dark:text-gray-300')
                  }
                  onClick={() => (isGroup ? toggleGroup(item.key) : null)}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r" aria-hidden="true"></span>}
                  {item.iconPath ? (
                    <img src={item.iconPath} alt={item.label} className="h-5 w-5" />
                  ) : (
                    <span className="w-5 text-center">{item.icon}</span>
                  )}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isGroup && !collapsed && (
                    <span className="ml-auto text-xs text-gray-400">{isOpen ? '▾' : '▸'}</span>
                  )}
                </button>
                {isGroup && isOpen && (
                  <ul className={collapsed ? 'hidden' : 'mt-1 ml-7 space-y-1'}>
                    {item.children!.map((child) => {
                      const cActive = child.key === activeKey
                      return (
                        <li key={child.key}>
                          <a
                            className={
                              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 ' +
                              (cActive
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30'
                                : 'text-gray-600 dark:text-gray-400')
                            }
                            href="#"
                            title={child.label}
                          >
                            {child.iconPath ? (
                              <img src={child.iconPath} alt={child.label} className="h-4 w-4" />
                            ) : (
                              <span className="w-4 text-center">{child.icon}</span>
                            )}
                            <span className="truncate">{child.label}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        {!collapsed ? (
          <div className="text-xs">
            <div className="font-medium text-gray-700 dark:text-gray-300">John Mathew</div>
            <button className="text-rose-600">Click to logout</button>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400">⎋</div>
        )}
      </div>
    </aside>
  )
}


