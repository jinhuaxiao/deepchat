import { ipcMain, IpcMainInvokeEvent, app } from 'electron'
// import { LlamaCppPresenter } from './llamaCppPresenter'
import { WindowPresenter } from './windowPresenter'
import { SQLitePresenter } from './sqlitePresenter'
import { ShortcutPresenter } from './shortcutPresenter'
import { IPresenter } from '@shared/presenter'
import { eventBus } from '@/eventbus'
import * as path from 'path'
import { LLMProviderPresenter } from './llmProviderPresenter'
import { ConfigPresenter } from './configPresenter'
import { ThreadPresenter } from './threadPresenter'
import { DevicePresenter } from './devicePresenter'
import { UpgradePresenter } from './upgradePresenter'
import { FilePresenter } from './filePresenter/FilePresenter'
import { McpPresenter } from './mcpPresenter'
import { SyncPresenter } from './syncPresenter'
import { DeeplinkPresenter } from './deeplinkPresenter'
import { ProfilePresenter } from './ProfilePresenter'
import { ProxyPresenter } from './ProxyPresenter'
import {
  CONFIG_EVENTS,
  CONVERSATION_EVENTS,
  STREAM_EVENTS,
  WINDOW_EVENTS,
  UPDATE_EVENTS,
  OLLAMA_EVENTS,
  MCP_EVENTS,
  SYNC_EVENTS,
  DEEPLINK_EVENTS,
  NOTIFICATION_EVENTS
} from '@/events'

export class Presenter implements IPresenter {
  windowPresenter: WindowPresenter
  sqlitePresenter: SQLitePresenter
  llmproviderPresenter: LLMProviderPresenter
  configPresenter: ConfigPresenter
  threadPresenter: ThreadPresenter
  devicePresenter: DevicePresenter
  upgradePresenter: UpgradePresenter
  shortcutPresenter: ShortcutPresenter
  filePresenter: FilePresenter
  mcpPresenter: McpPresenter
  syncPresenter: SyncPresenter
  deeplinkPresenter: DeeplinkPresenter
  profilePresenter: ProfilePresenter
  proxyPresenter: ProxyPresenter
  // llamaCppPresenter: LlamaCppPresenter

  constructor() {
    this.configPresenter = new ConfigPresenter()
    this.windowPresenter = new WindowPresenter(this.configPresenter)
    this.llmproviderPresenter = new LLMProviderPresenter(this.configPresenter)
    this.devicePresenter = new DevicePresenter()
    // 初始化 SQLite 数据库
    const dbDir = path.join(app.getPath('userData'), 'app_db')
    const dbPath = path.join(dbDir, 'chat.db')
    this.sqlitePresenter = new SQLitePresenter(dbPath)
    this.threadPresenter = new ThreadPresenter(
      this.sqlitePresenter,
      this.llmproviderPresenter,
      this.configPresenter
    )
    this.mcpPresenter = new McpPresenter(this.configPresenter)
    this.upgradePresenter = new UpgradePresenter()
    this.shortcutPresenter = new ShortcutPresenter(this.windowPresenter, this.configPresenter)
    this.filePresenter = new FilePresenter()
    this.syncPresenter = new SyncPresenter(this.configPresenter, this.sqlitePresenter)
    this.deeplinkPresenter = new DeeplinkPresenter()
    this.profilePresenter = new ProfilePresenter()
    this.proxyPresenter = new ProxyPresenter()
    // this.llamaCppPresenter = new LlamaCppPresenter()
    this.setupEventBus()
  }

  setupEventBus() {
    // 窗口事件
    eventBus.on(WINDOW_EVENTS.READY_TO_SHOW, () => {
      this.init()
    })

    // 配置相关事件
    eventBus.on(CONFIG_EVENTS.PROVIDER_CHANGED, () => {
      const providers = this.configPresenter.getProviders()
      this.llmproviderPresenter.setProviders(providers)
      this.windowPresenter.mainWindow?.webContents.send(CONFIG_EVENTS.PROVIDER_CHANGED)
    })

    // 流式响应事件
    eventBus.on(STREAM_EVENTS.RESPONSE, (msg) => {
      const dataToRender = { ...msg }
      delete dataToRender.tool_call_response_raw // 删除 rawData 字段,此处不需要上发给 renderer，节约性能
      this.windowPresenter.mainWindow?.webContents.send(STREAM_EVENTS.RESPONSE, dataToRender)
    })

    eventBus.on(STREAM_EVENTS.END, (msg) => {
      console.log('stream-end', msg.eventId)
      this.windowPresenter.mainWindow?.webContents.send(STREAM_EVENTS.END, msg)
    })

    eventBus.on(STREAM_EVENTS.ERROR, (msg) => {
      this.windowPresenter.mainWindow?.webContents.send(STREAM_EVENTS.ERROR, msg)
    })

    // 会话相关事件
    eventBus.on(CONVERSATION_EVENTS.ACTIVATED, (msg) => {
      this.windowPresenter.mainWindow?.webContents.send(CONVERSATION_EVENTS.ACTIVATED, msg)
    })

    eventBus.on(CONVERSATION_EVENTS.DEACTIVATED, (msg) => {
      this.windowPresenter.mainWindow?.webContents.send(CONVERSATION_EVENTS.DEACTIVATED, msg)
    })

    // 处理从ConfigPresenter过来的模型列表更新事件
    eventBus.on(CONFIG_EVENTS.MODEL_LIST_CHANGED, (providerId: string) => {
      // 转发事件到渲染进程
      this.windowPresenter.mainWindow?.webContents.send(
        CONFIG_EVENTS.MODEL_LIST_CHANGED,
        providerId
      )
    })

    eventBus.on(
      CONFIG_EVENTS.MODEL_STATUS_CHANGED,
      (providerId: string, modelId: string, enabled: boolean) => {
        this.windowPresenter.mainWindow?.webContents.send(CONFIG_EVENTS.MODEL_STATUS_CHANGED, {
          providerId,
          modelId,
          enabled
        })
      }
    )

    // 更新相关事件
    eventBus.on(UPDATE_EVENTS.STATUS_CHANGED, (msg) => {
      console.log(UPDATE_EVENTS.STATUS_CHANGED, msg)
      this.windowPresenter.mainWindow?.webContents.send(UPDATE_EVENTS.STATUS_CHANGED, msg)
    })

    eventBus.on(UPDATE_EVENTS.PROGRESS, (msg) => {
      console.log(UPDATE_EVENTS.PROGRESS, msg)
      this.windowPresenter.mainWindow?.webContents.send(UPDATE_EVENTS.PROGRESS, msg)
    })

    eventBus.on(UPDATE_EVENTS.WILL_RESTART, (msg) => {
      console.log(UPDATE_EVENTS.WILL_RESTART, msg)
      this.windowPresenter.mainWindow?.webContents.send(UPDATE_EVENTS.WILL_RESTART, msg)
    })

    eventBus.on(UPDATE_EVENTS.ERROR, (msg) => {
      console.log(UPDATE_EVENTS.ERROR, msg)
      this.windowPresenter.mainWindow?.webContents.send(UPDATE_EVENTS.ERROR, msg)
    })

    // 消息编辑事件
    eventBus.on(CONVERSATION_EVENTS.MESSAGE_EDITED, (msgId: string) => {
      this.windowPresenter.mainWindow?.webContents.send(CONVERSATION_EVENTS.MESSAGE_EDITED, msgId)
    })

    // MCP 相关事件
    eventBus.on(MCP_EVENTS.SERVER_STARTED, (serverName) => {
      this.windowPresenter.mainWindow?.webContents.send(MCP_EVENTS.SERVER_STARTED, serverName)
    })

    eventBus.on(MCP_EVENTS.SERVER_STOPPED, (serverName) => {
      this.windowPresenter.mainWindow?.webContents.send(MCP_EVENTS.SERVER_STOPPED, serverName)
    })

    eventBus.on(MCP_EVENTS.CONFIG_CHANGED, (config) => {
      this.windowPresenter.mainWindow?.webContents.send(MCP_EVENTS.CONFIG_CHANGED, config)
    })

    eventBus.on(MCP_EVENTS.TOOL_CALL_RESULT, (result) => {
      this.windowPresenter.mainWindow?.webContents.send(MCP_EVENTS.TOOL_CALL_RESULT, result)
    })

    // Ollama 相关事件
    eventBus.on(OLLAMA_EVENTS.PULL_MODEL_PROGRESS, (progress) => {
      this.windowPresenter.mainWindow?.webContents.send(OLLAMA_EVENTS.PULL_MODEL_PROGRESS, progress)
    })

    // 同步相关事件
    eventBus.on(SYNC_EVENTS.BACKUP_STARTED, () => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.BACKUP_STARTED)
    })

    eventBus.on(SYNC_EVENTS.BACKUP_COMPLETED, (time) => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.BACKUP_COMPLETED, time)
    })

    eventBus.on(SYNC_EVENTS.BACKUP_ERROR, (error) => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.BACKUP_ERROR, error)
    })

    eventBus.on(SYNC_EVENTS.IMPORT_STARTED, () => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.IMPORT_STARTED)
    })

    eventBus.on(SYNC_EVENTS.IMPORT_COMPLETED, () => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.IMPORT_COMPLETED)
    })

    eventBus.on(SYNC_EVENTS.IMPORT_ERROR, (error) => {
      this.windowPresenter.mainWindow?.webContents.send(SYNC_EVENTS.IMPORT_ERROR, error)
    })

    // DeepLink 相关事件
    eventBus.on(DEEPLINK_EVENTS.START, (msg) => {
      console.log('DEEPLINK_EVENTS.START', msg)
      this.windowPresenter.mainWindow?.webContents.send(DEEPLINK_EVENTS.START, msg)
    })
    eventBus.on(DEEPLINK_EVENTS.MCP_INSTALL, (mcpConfig) => {
      this.windowPresenter.mainWindow?.webContents.send(DEEPLINK_EVENTS.MCP_INSTALL, mcpConfig)
    })
    eventBus.on(NOTIFICATION_EVENTS.SHOW_ERROR, (error) => {
      this.windowPresenter.mainWindow?.webContents.send(NOTIFICATION_EVENTS.SHOW_ERROR, error)
    })

    // Potentially add Profile related event forwarding here later if needed
    // e.g., if profile list changes, notify renderer
    // eventBus.on(PROFILE_EVENTS.LIST_CHANGED, () => {
    //   this.windowPresenter.mainWindow?.webContents.send(PROFILE_EVENTS.LIST_CHANGED)
    // })
  }

  init() {
    if (this.windowPresenter.mainWindow) {
      // this.llamaCppPresenter.setMainwindow(this.windowPresenter.mainWindow)
    }
    // 持久化 LLMProviderPresenter 的 Providers 数据
    const providers = this.configPresenter.getProviders()
    this.llmproviderPresenter.setProviders(providers)

    // 同步所有 provider 的自定义模型
    this.syncCustomModels()
  }

  private async syncCustomModels() {
    const providers = this.configPresenter.getProviders()
    for (const provider of providers) {
      if (provider.enable) {
        const customModels = this.configPresenter.getCustomModels(provider.id)
        console.log('syncCustomModels', provider.id, customModels)
        for (const model of customModels) {
          await this.llmproviderPresenter.addCustomModel(provider.id, {
            id: model.id,
            name: model.name,
            contextLength: model.contextLength,
            maxTokens: model.maxTokens
          })
        }
      }
    }
  }

  // 在应用退出时关闭数据库连接
  destroy() {
    this.sqlitePresenter.close()
    this.shortcutPresenter.destroy()
    this.syncPresenter.destroy()
  }
}

export const presenter: IPresenter = {
  windowPresenter: new Presenter().windowPresenter,
  sqlitePresenter: new Presenter().sqlitePresenter,
  llmproviderPresenter: new Presenter().llmproviderPresenter,
  configPresenter: new Presenter().configPresenter,
  threadPresenter: new Presenter().threadPresenter,
  devicePresenter: new Presenter().devicePresenter,
  upgradePresenter: new Presenter().upgradePresenter,
  shortcutPresenter: new Presenter().shortcutPresenter,
  filePresenter: new Presenter().filePresenter,
  mcpPresenter: new Presenter().mcpPresenter,
  syncPresenter: new Presenter().syncPresenter,
  deeplinkPresenter: new Presenter().deeplinkPresenter,
  profilePresenter: new Presenter().profilePresenter,
  proxyPresenter: new Presenter().proxyPresenter,
  init: Presenter.prototype.init,
  destroy: Presenter.prototype.destroy
}

export const profilePresenter = new ProfilePresenter()
export const proxyPresenter = new ProxyPresenter()

ipcMain.handle(
  'presenter:call',
  (_event: IpcMainInvokeEvent, name: string, method: string, ...payloads: unknown[]) => {
    try {
      const calledPresenter = presenter[name]
      if (!calledPresenter) {
        console.warn('calling wrong presenter', name)
        return
      }
      if (!calledPresenter[method]) {
        console.warn('calling wrong presenter method', name, method)
        return
      }
      return calledPresenter[method](...payloads)
    } catch (e) {
      console.warn('error on presenter handle', e)
      return null
    }
  }
)
