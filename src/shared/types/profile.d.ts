export interface Profile {
  id: string // Unique identifier (e.g., UUID)
  name: string // User-defined name for the profile
  group?: string // Optional group name
  proxyId?: string // Reference to a proxy configuration by ID
  userAgent?: string // Custom User Agent string
  notes?: string // User notes
  createdAt: number // Timestamp of creation
  lastUsedAt?: number // Timestamp of last use
} 