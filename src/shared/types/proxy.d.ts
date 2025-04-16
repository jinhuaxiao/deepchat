export interface ProxyConfig {
  id: string
  name: string
  type: 'http' | 'https' | 'socks4' | 'socks5' | 'none'
  host: string
  port: number
  username?: string
  password?: string
  createdAt: number
  lastUsedAt?: number
} 