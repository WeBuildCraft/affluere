'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'

interface NotificationsViewProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onAuthRequired: () => void
}

export default function NotificationsView({
  isOpen,
  onClose,
  userId,
  onAuthRequired,
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url),
          pin:pins!notifications_pin_id_fkey(title)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data) {
        const mapped = data.map((n: Record<string, unknown>) => ({
          ...n,
          actor_username: (n.actor as Record<string, unknown>)?.username,
          actor_display_name: (n.actor as Record<string, unknown>)?.display_name,
          pin_title: (n.pin as Record<string, unknown>)?.title,
        })) as Notification[]
        setNotifications(mapped)
      }

      // Mark all as read
      await supabase.rpc('mark_all_notifications_read', { p_user_id: userId })
    }

    fetchNotifications()
  }, [isOpen, userId, supabase])

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `il y a ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `il y a ${days}j`
  }

  const getNotifText = (n: Notification) => {
    const name = n.actor_display_name || n.actor_username || 'Quelqu\'un'
    const pinTitle = n.pin_title || 'votre pin'
    switch (n.type) {
      case 'reaction':
        return `<b>@${n.actor_username}</b> a reagi a <i>${pinTitle}</i>`
      case 'comment':
        return `<b>@${n.actor_username}</b> a commente <i>${pinTitle}</i>`
      case 'reply':
        return `<b>@${n.actor_username}</b> a repondu a votre commentaire sur <i>${pinTitle}</i>`
      default:
        return `<b>@${n.actor_username}</b> a interagi avec <i>${pinTitle}</i>`
    }
  }

  const initial = (n: Notification) =>
    (n.actor_username || '?')[0].toUpperCase()

  return (
    <div className={`view-overlay${isOpen ? ' open' : ''}`}>
      <div className="view-header">
        <span className="view-header-title">Notifications</span>
        <button className="view-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="view-content">
        {!userId ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔔</div>
            <p>Connectez-vous pour voir vos notifications</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onAuthRequired}>
              Se connecter
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔔</div>
            <p>Aucune notification</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="notif-item">
              <div className="notif-avatar">{initial(n)}</div>
              <div>
                <div
                  className="notif-text"
                  dangerouslySetInnerHTML={{ __html: getNotifText(n) }}
                />
                <div className="notif-time">{timeAgo(n.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
