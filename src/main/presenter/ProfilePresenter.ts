import { profileManager } from '../managers/ProfileManager'
import { Profile } from '../../shared/types/profile'
import { BrowserWindow, session } from 'electron'
import { proxyPresenter } from './index'
import { spawn } from 'child_process'
import { presenter } from '../presenter'
import * as fs from 'fs'

export class ProfilePresenter {
  // Get all profiles
  getAllProfiles(): Profile[] {
    return profileManager.getAllProfiles()
  }

  // Create a new profile
  createProfile(profileData: Omit<Profile, 'id' | 'createdAt'>): Profile {
    // We might want to add validation here in the future
    return profileManager.createProfile(profileData)
  }

  // Update an existing profile
  updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | undefined {
    return profileManager.updateProfile(id, updates)
  }

  // Delete a profile
  deleteProfile(id: string): boolean {
    return profileManager.deleteProfile(id)
  }

  // Placeholder for launching a profile's browser instance
  async openProfile(id: string): Promise<void> {
    const profile = profileManager.getProfileById(id)
    if (!profile) {
      console.error(`[ProfilePresenter] Profile with id ${id} not found for opening.`)
      throw new Error(`Profile with id ${id} not found.`)
    }

    console.log(`[ProfilePresenter] Opening browser for profile: ${profile.name} (${id})`)

    // 获取浏览器路径
    const browserPath = presenter.configPresenter.getBrowserPath()
    
    if (!browserPath || !fs.existsSync(browserPath)) {
      console.error(`[ProfilePresenter] Browser path is not set or invalid: ${browserPath}`)
      throw new Error('浏览器路径未设置或无效。请在设置中配置浏览器路径。')
    }

    // 1. 定义会话分区
    const partition = `persist:profile-${id}`
    const profileSession = session.fromPartition(partition)

    // 2. 配置代理 (如果配置文件有proxyId)
    if (profile.proxyId) {
      try {
        await proxyPresenter.applyProxyToSession(profile.proxyId, partition)
      } catch (err) {
        console.error(`[ProfilePresenter] Failed to apply proxy for profile ${profile.name}:`, err)
        // 如果失败，继续不使用代理
      }
    } else {
      // 清除此会话的任何现有代理
      try {
        await profileSession.setProxy({ proxyRules: '' })
      } catch (err) {
        console.error(`[ProfilePresenter] Failed to clear proxy for ${profile.name}:`, err)
      }
    }

    // 构建命令行参数
    const args = [
      `--user-data-dir=${profileSession.storagePath}`,
      '--no-first-run'
    ]
    
    // 添加用户代理（如果配置了）
    if (profile.userAgent) {
      args.push(`--user-agent="${profile.userAgent}"`)
    }
    
    // 默认加载URL
    args.push('https://whoer.net/')
    
    try {
      // 启动外部浏览器进程
      const browserProcess = spawn(browserPath, args, {
        detached: true,
        stdio: 'ignore'
      })
      
      // 让进程在后台运行
      browserProcess.unref()
      
      // 更新上次使用时间戳
      profileManager.updateProfile(id, { lastUsedAt: Date.now() })
      
      console.log(`[ProfilePresenter] Successfully launched browser for profile: ${profile.name}`)
    } catch (error) {
      console.error(`[ProfilePresenter] Failed to launch browser for profile ${profile.name}:`, error)
      throw new Error(`启动浏览器失败: ${error.message}`)
    }
  }
} 