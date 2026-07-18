// Auto-generated types matching the Supabase schema

export type UserRole = 'user' | 'admin'
export type HomeArea = 'bordeaux' | 'lormont' | 'cenon'
export type ContentType = 'observation' | 'story' | 'photo' | 'question' | 'conversation'
export type PinVisibility = 'published' | 'hidden' | 'removed'
export type ModerationStatus = 'clean' | 'reported' | 'under_review' | 'removed'
export type CommentModeration = 'clean' | 'reported' | 'removed'
export type ReactionType = 'like' | 'interesting' | 'beautiful' | 'noticed_too'
export type ReportTarget = 'pin' | 'comment' | 'user'
export type ReportReason = 'harassment' | 'hate_speech' | 'spam' | 'privacy_violation' | 'false_information' | 'graphic_content' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed'
export type NotificationType = 'reaction' | 'comment' | 'reply'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  city: string | null
  avatar_url: string | null
  home_area: HomeArea | null
  role: UserRole
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface Pin {
  id: string
  creator_id: string
  latitude: number
  longitude: number
  location_name: string | null
  city: string
  neighbourhood: string | null
  content_type: ContentType
  title: string | null
  description: string | null
  visibility: PinVisibility
  moderation_status: ModerationStatus
  created_at: string
  updated_at: string
}

export interface PinDetail extends Pin {
  author_username: string
  author_display_name: string | null
  author_avatar_url: string | null
  like_count: number
  interesting_count: number
  beautiful_count: number
  noticed_count: number
  reaction_count: number
  comment_count: number
}

export interface Photo {
  id: string
  pin_id: string
  url: string
  thumbnail_url: string | null
  alt_text: string | null
  position: number
  created_at: string
  deleted_at: string | null
}

export interface Reaction {
  id: string
  pin_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export interface Comment {
  id: string
  pin_id: string
  user_id: string
  parent_id: string | null
  body: string
  is_deleted: boolean
  moderation_status: CommentModeration
  created_at: string
  updated_at: string
  // joined
  username?: string
  display_name?: string | null
  avatar_url?: string | null
  replies?: Comment[]
}

export interface SavedPin {
  id: string
  user_id: string
  pin_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTarget
  target_id: string
  reason: ReportReason
  detail: string | null
  status: ReportStatus
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string
  type: NotificationType
  pin_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
  // joined
  actor_username?: string
  actor_display_name?: string | null
  pin_title?: string | null
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

// Content type metadata
export const CONTENT_TYPES: Record<ContentType, { label: string; color: string }> = {
  observation: { label: 'Observation', color: '#e8643a' },
  story:       { label: 'Histoire',    color: '#8b5cf6' },
  photo:       { label: 'Photo',       color: '#06b6d4' },
  question:    { label: 'Question',    color: '#f59e0b' },
  conversation:{ label: 'Conversation',color: '#22a55b' },
}

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: 'J\'aime',
  interesting: 'Intéressant',
  beautiful: 'Beau',
  noticed_too: 'Remarqué aussi',
}
