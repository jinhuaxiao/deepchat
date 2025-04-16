import { ProxyConfig } from '../../shared/types/proxy'
import { v4 as uuidv4 } from 'uuid'
import { session } from 'electron'

class ProxyManager {
  private proxies: Map<string, ProxyConfig> = new Map()

  constructor() {
    // In a real implementation, you would load from storage
    this.loadProxiesFromStorage()
  }

  private loadProxiesFromStorage() {
    // TODO: Implement loading from persistent storage
    // For now, we'll just have an empty collection
  }

  private saveProxiesToStorage() {
    // TODO: Implement saving to persistent storage
    console.log('Saving proxies to storage:', Array.from(this.proxies.values()))
  }

  getAllProxies(): ProxyConfig[] {
    return Array.from(this.proxies.values())
  }

  getProxyById(id: string): ProxyConfig | undefined {
    return this.proxies.get(id)
  }

  createProxy(proxyData: Omit<ProxyConfig, 'id' | 'createdAt'>): ProxyConfig {
    const id = uuidv4()
    const newProxy: ProxyConfig = {
      ...proxyData,
      id,
      createdAt: Date.now()
    }

    this.proxies.set(id, newProxy)
    this.saveProxiesToStorage()
    return newProxy
  }

  updateProxy(id: string, updates: Partial<Omit<ProxyConfig, 'id' | 'createdAt'>>): ProxyConfig | undefined {
    const existingProxy = this.proxies.get(id)
    if (!existingProxy) {
      return undefined
    }

    const updatedProxy = {
      ...existingProxy,
      ...updates,
      lastUsedAt: updates.lastUsedAt || existingProxy.lastUsedAt
    }

    this.proxies.set(id, updatedProxy)
    this.saveProxiesToStorage()
    return updatedProxy
  }

  deleteProxy(id: string): boolean {
    const deleted = this.proxies.delete(id)
    if (deleted) {
      this.saveProxiesToStorage()
    }
    return deleted
  }
}

// Singleton instance
const proxyManager = new ProxyManager()

export class ProxyPresenter {
  getAllProxies(): ProxyConfig[] {
    return proxyManager.getAllProxies()
  }

  getProxyById(id: string): ProxyConfig | undefined {
    return proxyManager.getProxyById(id)
  }

  createProxy(proxyData: Omit<ProxyConfig, 'id' | 'createdAt'>): ProxyConfig {
    return proxyManager.createProxy(proxyData)
  }

  updateProxy(id: string, updates: Partial<Omit<ProxyConfig, 'id' | 'createdAt'>>): ProxyConfig | undefined {
    return proxyManager.updateProxy(id, updates)
  }

  deleteProxy(id: string): boolean {
    return proxyManager.deleteProxy(id)
  }

  isProxyInUse(id: string): boolean {
    // In a real implementation, this would check if any profiles reference this proxy
    // For now, we'll just return false
    return false
  }

  // Apply proxy configuration to an Electron session
  async applyProxyToSession(proxyId: string, sessionPartition: string): Promise<boolean> {
    const proxy = proxyManager.getProxyById(proxyId)
    if (!proxy || proxy.type === 'none') {
      // Clear proxy settings for this session
      try {
        await session.fromPartition(sessionPartition).setProxy({ proxyRules: '' })
        return true
      } catch (err) {
        console.error(`Failed to clear proxy for session ${sessionPartition}:`, err)
        return false
      }
    }

    // Apply proxy settings
    const proxyRules = `${proxy.type}://${proxy.host}:${proxy.port}`
    const proxyConfig = {
      proxyRules,
      // Add bypass rules if needed, e.g., proxyBypassRules: '<local>'
    }

    try {
      await session.fromPartition(sessionPartition).setProxy(proxyConfig)
      console.log(`Proxy set for session ${sessionPartition}: ${proxyRules}`)
      
      // Update last used timestamp
      proxyManager.updateProxy(proxyId, { lastUsedAt: Date.now() })
      
      return true
    } catch (err) {
      console.error(`Failed to set proxy for session ${sessionPartition}:`, err)
      return false
    }
  }
} 