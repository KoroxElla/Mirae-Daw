export interface AvatarData {
  id?: string
  userId?: string
  glbUrl: string
  thumbnailUrl?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: {
    outfit?: string
    hair?: string
    accessories?: string[]
    [key: string]: any
  }
}

export interface CustomizationState {
  isOpen: boolean
  isSaving: boolean
  error: string | null
  avatarData: AvatarData | null
}
