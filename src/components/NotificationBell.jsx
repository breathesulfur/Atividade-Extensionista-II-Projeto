import React, { useState, useEffect, useRef } from 'react'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, subscribeToNotifications } from '../lib/db'
import './NotificationBell.css'

const TYPE_ICON = {
  comment: '💬',
  reaction: '😊',
  group_join: '👥',
  group_message: '🎮',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min atrás`
  if (h < 24) return `${h}h atrás`
  return `${d}d atrás`
}

function NotificationBell({ user, onOpenPost, onOpenGroup }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user?.id) return
    fetchNotifications(user.id).then(setNotifications)

    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
    })

    return unsubscribe
  }, [user?.id])

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    setOpen(prev => !prev)
    if (!open && unread > 0) {
      await markAllNotificationsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteNotification(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // FIX QA: clicar numa notificação direciona para a publicação ou grupo
  // associado (em vez de só marcar como lida).
  const handleNotificationClick = (notification) => {
    setOpen(false)
    if (notification.post_id && typeof onOpenPost === 'function') {
      onOpenPost(notification.post_id)
    } else if (notification.group_id && typeof onOpenGroup === 'function') {
      onOpenGroup(notification.group_id)
    }
  }

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-button" onClick={handleOpen} aria-label="Notificações">
        🔔
        {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notificações</span>
            {notifications.length > 0 && (
              <button className="clear-all" onClick={async () => {
                await Promise.all(notifications.map(n => deleteNotification(n.id)))
                setNotifications([])
              }}>
                Limpar tudo
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">Nenhuma notificação ainda ✨</div>
          ) : (
            <ul className="notification-list">
              {notifications.map(n => {
                // FIX QA: cada notificação clicável direciona para a publicação/grupo
                const isNavigable = !!(n.post_id || n.group_id)
                return (
                  <li
                    key={n.id}
                    className={`notification-item ${n.read ? 'read' : 'unread'} ${isNavigable ? 'navigable' : ''}`}
                    onClick={isNavigable ? () => handleNotificationClick(n) : undefined}
                    role={isNavigable ? 'button' : undefined}
                    tabIndex={isNavigable ? 0 : undefined}
                    onKeyDown={isNavigable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleNotificationClick(n)
                      }
                    } : undefined}
                    aria-label={isNavigable ? `Abrir ${n.post_id ? 'publicação' : 'grupo'} associado` : undefined}
                  >
                    <span className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</span>
                    <div className="notif-body">
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{timeAgo(n.created_at)}</span>
                    </div>
                    <button className="notif-delete" onClick={(e) => handleDelete(e, n.id)} aria-label="Remover">×</button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
