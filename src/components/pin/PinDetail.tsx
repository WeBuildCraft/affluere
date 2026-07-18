'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PinDetail as PinDetailType, Comment, ReactionType, ContentType } from '@/types/database'
import { CONTENT_TYPES, REACTION_LABELS } from '@/types/database'

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '❤️',
  interesting: '👀',
  beautiful: '💡',
  noticed_too: '🙌',
}

interface PinDetailProps {
  pin: PinDetailType | null
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onAuthRequired: () => void
  onToast: (msg: string) => void
}

export default function PinDetailPanel({
  pin,
  isOpen,
  onClose,
  userId,
  onAuthRequired,
  onToast,
}: PinDetailProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [userReactions, setUserReactions] = useState<ReactionType[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({
    like: 0, interesting: 0, beautiful: 0, noticed_too: 0,
  })
  const [showReport, setShowReport] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!pin || !isOpen) return

    // Fetch comments
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, username:profiles(username, display_name, avatar_url)')
        .eq('pin_id', pin.id)
        .eq('is_deleted', false)
        .neq('moderation_status', 'removed')
        .order('created_at', { ascending: true })

      if (data) {
        const mapped: Comment[] = data.map((c: Record<string, unknown>) => ({
          ...c,
          username: (c.username as Record<string, unknown>)?.username as string,
          display_name: (c.username as Record<string, unknown>)?.display_name as string | null,
          avatar_url: (c.username as Record<string, unknown>)?.avatar_url as string | null,
        })) as Comment[]

        // Organize into threads
        const roots = mapped.filter((c) => !c.parent_id)
        const replies = mapped.filter((c) => c.parent_id)
        roots.forEach((r) => {
          r.replies = replies.filter((rep) => rep.parent_id === r.id)
        })
        setComments(roots)
      }
    }

    // Fetch user's reactions and saved status
    const fetchUserState = async () => {
      if (!userId) return

      const { data: reactions } = await supabase
        .from('reactions')
        .select('type')
        .eq('pin_id', pin.id)
        .eq('user_id', userId)

      if (reactions) {
        setUserReactions(reactions.map((r: { type: ReactionType }) => r.type))
      }

      const { data: saved } = await supabase
        .from('saved_pins')
        .select('id')
        .eq('pin_id', pin.id)
        .eq('user_id', userId)
        .maybeSingle()

      setIsSaved(!!saved)
    }

    setReactionCounts({
      like: pin.like_count,
      interesting: pin.interesting_count,
      beautiful: pin.beautiful_count,
      noticed_too: pin.noticed_count,
    })

    fetchComments()
    fetchUserState()
  }, [pin, isOpen, userId, supabase])

  const handleReaction = async (type: ReactionType) => {
    if (!userId) { onAuthRequired(); return }
    if (!pin) return

    if (userReactions.includes(type)) {
      // Remove reaction
      await supabase
        .from('reactions')
        .delete()
        .eq('pin_id', pin.id)
        .eq('user_id', userId)
        .eq('type', type)
      setUserReactions((prev) => prev.filter((r) => r !== type))
      setReactionCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))
    } else {
      // Add reaction
      const { error } = await supabase
        .from('reactions')
        .insert({ pin_id: pin.id, user_id: userId, type })
      if (!error) {
        setUserReactions((prev) => [...prev, type])
        setReactionCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }))
      }
    }
  }

  const handleSave = async () => {
    if (!userId) { onAuthRequired(); return }
    if (!pin) return

    if (isSaved) {
      await supabase
        .from('saved_pins')
        .delete()
        .eq('pin_id', pin.id)
        .eq('user_id', userId)
      setIsSaved(false)
      onToast('Pin retire des sauvegardes')
    } else {
      const { error } = await supabase
        .from('saved_pins')
        .insert({ pin_id: pin.id, user_id: userId })
      if (!error) {
        setIsSaved(true)
        onToast('Pin sauvegarde !')
      }
    }
  }

  const handleComment = async () => {
    if (!userId) { onAuthRequired(); return }
    if (!pin || !commentText.trim()) return

    const { data, error } = await supabase
      .from('comments')
      .insert({
        pin_id: pin.id,
        user_id: userId,
        body: commentText.trim(),
      })
      .select('*, username:profiles(username, display_name, avatar_url)')
      .single()

    if (!error && data) {
      const raw = data as Record<string, unknown>
      const joined = raw.username as Record<string, unknown> | null
      const newComment = {
        ...raw,
        username: joined?.username as string ?? '',
        display_name: (joined?.display_name as string | null) ?? null,
        avatar_url: (joined?.avatar_url as string | null) ?? null,
        replies: [],
      } as unknown as Comment
      setComments((prev) => [...prev, newComment])
      setCommentText('')
      onToast('Commentaire ajoute')
    }
  }

  const handleShare = () => {
    if (pin) {
      navigator.clipboard?.writeText(`${window.location.origin}/?pin=${pin.id}`)
      onToast('Lien copie !')
    }
  }

  const handleReport = async () => {
    if (!userId) { onAuthRequired(); return }
    if (!pin || !selectedReport) return

    const reasonMap: Record<string, string> = {
      'Contenu inapproprie': 'graphic_content',
      'Spam': 'spam',
      'Harcelement': 'harassment',
      'Fausse information': 'false_information',
      'Atteinte a la vie privee': 'privacy_violation',
    }

    await supabase.from('reports').insert({
      reporter_id: userId,
      target_type: 'pin',
      target_id: pin.id,
      reason: reasonMap[selectedReport] || 'other',
    })

    setShowReport(false)
    setSelectedReport(null)
    onToast('Signalement envoye')
  }

  if (!pin) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const months = ['janv.','fevr.','mars','avr.','mai','juin','juil.','aout','sept.','oct.','nov.','dec.']
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `il y a ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `il y a ${days}j`
  }

  const typeColor = CONTENT_TYPES[pin.content_type as ContentType]?.color || '#e8643a'
  const initial = (pin.author_display_name || pin.author_username || '?')[0].toUpperCase()

  return (
    <>
      <div className={`side-panel${isOpen ? ' open' : ''}`}>
        <div className="side-panel-close">
          <button className="side-panel-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Meta */}
        <div className="pin-detail-meta">
          <span className="pin-detail-type" style={{ background: typeColor }} />
          {formatDate(pin.created_at)} · {pin.latitude.toFixed(4)}°N {Math.abs(pin.longitude).toFixed(4)}°W
          <br />
          {pin.location_name?.toUpperCase()}{pin.neighbourhood ? `, ${pin.neighbourhood.toUpperCase()}` : ''}
        </div>

        {/* Body */}
        <div className="pin-detail-body">
          {pin.title && <div className="pin-detail-title">{pin.title}</div>}
          {pin.description && <div className="pin-detail-text">{pin.description}</div>}
        </div>

        {/* Author */}
        <div className="pin-detail-author">
          <div className="pin-author-avatar">
            {pin.author_avatar_url ? (
              <img src={pin.author_avatar_url} alt="" />
            ) : (
              initial
            )}
          </div>
          <div className="pin-author-info">
            <div className="pin-author-name">@{pin.author_username}</div>
            <div>{pin.city} · {formatDate(pin.created_at)}</div>
          </div>
        </div>

        {/* Reactions */}
        <div className="pin-reactions">
          {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(([type, emoji]) => (
            <button
              key={type}
              className={`reaction-btn${userReactions.includes(type) ? ' active' : ''}`}
              onClick={() => handleReaction(type)}
            >
              {emoji} {reactionCounts[type]}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="pin-actions">
          <button
            className={`pin-action-btn${isSaved ? ' saved' : ''}`}
            onClick={handleSave}
          >
            {isSaved ? '★ Sauvegarde' : '☆ Sauvegarder'}
          </button>
          <button className="pin-action-btn" onClick={handleShare}>
            Partager
          </button>
          <button className="pin-action-btn" onClick={() => {
            if (!userId) { onAuthRequired(); return }
            setShowReport(true)
          }}>
            Signaler
          </button>
        </div>

        {/* Comments */}
        <div className="pin-comments">
          <div className="pin-comments-title">
            Commentaires ({comments.reduce((s, c) => s + 1 + (c.replies?.length || 0), 0)})
          </div>
          {comments.map((c) => (
            <div key={c.id}>
              <div className="comment">
                <div className="comment-header">
                  <div className="comment-avatar">
                    {c.avatar_url ? <img src={c.avatar_url} alt="" /> : (c.username?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="comment-author">@{c.username}</span>
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                </div>
                <div className="comment-text">{c.body}</div>
              </div>
              {c.replies?.map((r) => (
                <div key={r.id} className="comment-reply">
                  <div className="comment">
                    <div className="comment-header">
                      <div className="comment-avatar">
                        {r.avatar_url ? <img src={r.avatar_url} alt="" /> : (r.username?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="comment-author">@{r.username}</span>
                      <span className="comment-time">{timeAgo(r.created_at)}</span>
                    </div>
                    <div className="comment-text">{r.body}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div className="comment-input-wrap">
          <input
            type="text"
            className="comment-input"
            placeholder="Ecrire un commentaire..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleComment() }}
          />
          <button className="comment-send" onClick={handleComment}>
            Envoyer
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay open" onClick={() => setShowReport(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Signaler ce contenu</div>
            {['Contenu inapproprie', 'Spam', 'Harcelement', 'Fausse information', 'Atteinte a la vie privee'].map((opt) => (
              <button
                key={opt}
                className={`report-option${selectedReport === opt ? ' selected' : ''}`}
                onClick={() => setSelectedReport(opt)}
              >
                {opt}
              </button>
            ))}
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowReport(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleReport} disabled={!selectedReport}>Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
