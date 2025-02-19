import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  UserMessageContent,
  AssistantMessageBlock,
  AssistantMessage,
  UserMessage
} from '@shared/chat'
import type { CONVERSATION, CONVERSATION_SETTINGS } from '@shared/presenter'
import { usePresenter } from '@/composables/usePresenter'
// import DeepSeekLogo from '@/assets/llm-icons/deepseek-color.svg'
// import BaiduLogo from '@/assets/llm-icons/baidu-color.svg'
// import GoogleLogo from '@/assets/llm-icons/google-color.svg'

// const fakeMessage: AssistantMessage = {
//   id: '1',
//   avatar: DeepSeekLogo,
//   name: 'DeepSeek R1',
//   model_name: 'DeepSeek R1',
//   conversationId: '1',
//   model_id: 'sksadfjkasd',
//   model_provider: 'siliconflow',
//   status: 'sent',
//   error: '',
//   is_variant: 0,
//   usage: {
//     tokens_per_second: 123,
//     total_tokens: 123,
//     prompt_tokens: 123,
//     completion_tokens: 123
//   },
//   content: [
//     {
//       type: 'search',
//       extra: {
//         total: 40,
//         pages: [
//           {
//             title: '网页1',
//             url: 'https://www.baidu.com',
//             icon: BaiduLogo
//           },
//           {
//             title: '网页2',
//             url: 'https://www.baidu.com',
//             icon: GoogleLogo
//           },
//           {
//             title: '网页3',
//             url: 'https://www.baidu.com',
//             icon: GoogleLogo
//           }
//         ]
//       },
//       status: 'success',
//       timestamp: Date.now()
//     },
//     {
//       type: 'reasoning_content',
//       content: '思考中...',
//       status: 'loading',
//       timestamp: Date.now()
//     },
//     {
//       type: 'reasoning_content',
//       content: '让我好好想一想',
//       status: 'loading',
//       timestamp: Date.now()
//     },
//     {
//       type: 'reasoning_content',
//       content: '我也不知道想到了些什么东西？',
//       status: 'success',
//       timestamp: Date.now()
//     },
//     {
//       type: 'search',
//       extra: {
//         total: 40,
//         pages: [
//           {
//             title: '网页1',
//             url: 'https://www.baidu.com',
//             icon: BaiduLogo
//           },
//           {
//             title: '网页2',
//             url: 'https://www.baidu.com',
//             icon: GoogleLogo
//           },
//           {
//             title: '网页3',
//             url: 'https://www.baidu.com',
//             icon: BaiduLogo
//           }
//         ]
//       },
//       status: 'loading',
//       timestamp: Date.now()
//     },
//     {
//       type: 'search',
//       extra: {},
//       status: 'loading',
//       timestamp: Date.now()
//     },

//     {
//       type: 'content',
//       content: '欢迎使用聊天界面！',
//       status: 'loading',
//       timestamp: Date.now()
//     },
//     {
//       type: 'content',
//       content: '欢迎使用聊天界面！',
//       status: 'success',
//       timestamp: Date.now()
//     }
//   ],
//   role: 'assistant',
//   timestamp: Date.now()
// }

// const fakeUserMessage: UserMessage = {
//   id: '1',
//   avatar: '',
//   name: '用户',
//   role: 'user',
//   model_name: '',
//   model_id: '',
//   model_provider: '',
//   status: 'sent',
//   error: '',
//   is_variant: 0,
//   usage: {
//     tokens_per_second: 0,
//     total_tokens: 0,
//     prompt_tokens: 0,
//     completion_tokens: 0
//   },
//   conversationId: '1',
//   timestamp: Date.now(),
//   content: {
//     files: [
//       {
//         name: 'test.txt',
//         type: 'text/plain',
//         size: 100,
//         token: 100,
//         path: 'test.txt'
//       }
//     ],
//     links: [],
//     reasoning_content: true,
//     search: true,
//     think: true,
//     text: '你好，我是DeepSeek R1，很高兴认识你！'
//   }
// }

export const useChatStore = defineStore('chat', () => {
  const threadP = usePresenter('threadPresenter')

  // 状态
  const activeThreadId = ref<string | null>(null)
  const threads = ref<
    {
      dt: string
      dtThreads: CONVERSATION[]
    }[]
  >([])
  const messages = ref<AssistantMessage[] | UserMessage[]>([])
  // messages.value.push(fakeMessage)
  // messages.value.push(fakeUserMessage)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const generatingThreadIds = ref(new Set<string>())
  // const currentPage = ref(1)
  const pageSize = ref(20)
  const hasMore = ref(true)

  // 添加消息生成缓存
  const generatingMessagesCache = ref<
    Map<
      string,
      {
        message: AssistantMessage | UserMessage
        threadId: string
      }
    >
  >(new Map())

  // 对话配置状态
  const chatConfig = ref<CONVERSATION_SETTINGS>({
    systemPrompt: '',
    temperature: 0.7,
    contextLength: 32000,
    maxTokens: 8000,
    providerId: '',
    modelId: ''
  })

  // Getters
  const activeThread = computed(() => {
    return threads.value.flatMap((t) => t.dtThreads).find((t) => t.id === activeThreadId.value)
  })

  // Actions
  const loadThreads = async (page: number) => {
    if (isLoading.value || (!hasMore.value && page !== 1)) {
      return
    }
    try {
      isLoading.value = true
      const result = await threadP.getConversationList(page, pageSize.value)

      // 按日期分组处理会话列表
      const groupedThreads: Map<string, CONVERSATION[]> = new Map()

      result.list.forEach((conv) => {
        const date = new Date(conv.createdAt).toISOString().split('T')[0]
        if (!groupedThreads.has(date)) {
          groupedThreads.set(date, [])
        }
        groupedThreads.get(date)?.push({
          ...conv
        })
      })

      // 转换为组件所需的数据结构
      const newThreads = Array.from(groupedThreads.entries()).map(([dt, dtThreads]) => ({
        dt,
        dtThreads
      }))

      // 判断是否还有更多数据
      hasMore.value = result.list.length === pageSize.value

      if (page === 1) {
        threads.value = newThreads
      } else {
        // 合并现有数据和新数据，需要处理同一天的数据
        newThreads.forEach((newThread) => {
          const existingThread = threads.value.find((t) => t.dt === newThread.dt)
          if (existingThread) {
            existingThread.dtThreads.push(...newThread.dtThreads)
          } else {
            threads.value.push(newThread)
          }
        })
        // 按日期排序
        threads.value.sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime())
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createThread = async (title: string, settings: Partial<CONVERSATION_SETTINGS>) => {
    try {
      const threadId = await threadP.createConversation(title, settings)
      await loadThreads(1)
      return threadId
    } catch (error) {
      console.error('创建会话失败:', error)
      throw error
    }
  }

  const setActiveThread = async (threadId: string) => {
    try {
      await threadP.setActiveConversation(threadId)
      activeThreadId.value = threadId
      // no need to load messages and chat config here, because they will be loaded when the conversation-activated event is triggered
      // await loadMessages()
      // await loadChatConfig() // 加载对话配置
    } catch (error) {
      console.error('设置活动会话失败:', error)
      throw error
    }
  }

  const clearActiveThread = async () => {
    if (!activeThreadId.value) return
    await threadP.clearActiveThread()
    activeThreadId.value = null
  }

  const loadMessages = async () => {
    if (!activeThreadId.value) return

    try {
      const result = await threadP.getMessages(activeThreadId.value, 1, 100)
      // 合并数据库消息和缓存中的消息
      const mergedMessages = [...result.list]

      // 查找当前会话的缓存消息
      for (const [, cached] of generatingMessagesCache.value) {
        if (cached.threadId === activeThreadId.value) {
          const message = cached.message
          if (message.is_variant && message.parentId) {
            // 如果是变体消息，找到父消息并添加到其 variants 数组中
            const parentMsg = mergedMessages.find((m) => m.parentId === message.parentId)
            if (parentMsg) {
              if (!parentMsg.variants) {
                parentMsg.variants = []
              }
              const existingVariantIndex = parentMsg.variants.findIndex((v) => v.id === message.id)
              if (existingVariantIndex !== -1) {
                parentMsg.variants[existingVariantIndex] = message
              } else {
                parentMsg.variants.push(message)
              }
            }
          } else {
            // 如果是非变体消息，直接更新或添加到消息列表
            const existingIndex = mergedMessages.findIndex((m) => m.id === message.id)
            if (existingIndex !== -1) {
              mergedMessages[existingIndex] = message
            } else {
              mergedMessages.push(message)
            }
          }
        }
      }

      messages.value = mergedMessages
    } catch (error) {
      console.error('加载消息失败:', error)
      throw error
    }
  }

  const sendMessage = async (content: UserMessageContent | AssistantMessageBlock[]) => {
    if (!activeThreadId.value || !content) return

    try {
      isGenerating.value = true
      generatingThreadIds.value.add(activeThreadId.value)
      const aiResponseMessage = await threadP.sendMessage(
        activeThreadId.value,
        JSON.stringify(content),
        'user'
      )

      // 将消息添加到缓存
      generatingMessagesCache.value.set(aiResponseMessage.id, {
        message: aiResponseMessage,
        threadId: activeThreadId.value
      })

      await loadMessages()
      await threadP.startStreamCompletion(activeThreadId.value)
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  const retryMessage = async (messageId: string) => {
    if (!activeThreadId.value) return
    try {
      const aiResponseMessage = await threadP.retryMessage(messageId, chatConfig.value.modelId)
      // 将消息添加到缓存
      generatingMessagesCache.value.set(aiResponseMessage.id, {
        message: aiResponseMessage,
        threadId: activeThreadId.value
      })
      await loadMessages()
      await threadP.startStreamCompletion(activeThreadId.value, messageId)
    } catch (error) {
      console.error('重试消息失败:', error)
      throw error
    }
  }
  const handleStreamResponse = (msg: {
    eventId: string
    content?: string
    reasoning_content?: string
  }) => {
    // 从缓存中查找消息
    const cached = generatingMessagesCache.value.get(msg.eventId)
    if (cached) {
      const curMsg = cached.message as AssistantMessage
      if (curMsg.content) {
        // 处理普通内容
        if (msg.content) {
          const lastContentBlock = curMsg.content[curMsg.content.length - 1]
          if (lastContentBlock && lastContentBlock.type === 'content') {
            lastContentBlock.content += msg.content
          } else {
            if (lastContentBlock) {
              lastContentBlock.status = 'success'
            }
            curMsg.content.push({
              type: 'content',
              content: msg.content,
              status: 'loading',
              timestamp: Date.now()
            })
          }
        }

        // 处理推理内容
        if (msg.reasoning_content) {
          const lastReasoningBlock = curMsg.content[curMsg.content.length - 1]
          if (lastReasoningBlock && lastReasoningBlock.type === 'reasoning_content') {
            lastReasoningBlock.content += msg.reasoning_content
          } else {
            if (lastReasoningBlock) {
              lastReasoningBlock.status = 'success'
            }
            curMsg.content.push({
              type: 'reasoning_content',
              content: msg.reasoning_content,
              status: 'loading',
              timestamp: Date.now()
            })
          }
        }
      }

      // 如果是当前激活的会话，更新显示
      if (cached.threadId === activeThreadId.value) {
        const msgIndex = messages.value.findIndex((m) => m.id === msg.eventId)
        if (msgIndex !== -1) {
          messages.value[msgIndex] = curMsg
        }
      }
    }
  }

  const handleStreamEnd = async (msg: { eventId: string }) => {
    isGenerating.value = false

    // 从缓存中移除消息
    const cached = generatingMessagesCache.value.get(msg.eventId)
    if (cached) {
      generatingMessagesCache.value.delete(msg.eventId)

      // 如果是当前激活的会话，重新加载消息
      if (cached.threadId === activeThreadId.value) {
        generatingThreadIds.value.delete(cached.threadId)
        await loadMessages()

        // 检查是否需要更新标题（第一条消息生成完成后）
        const thread = await threadP.getConversation(cached.threadId)
        const messages = await threadP.getMessages(cached.threadId, 1, 2)
        if (messages.list.length === 2 && thread) {
          try {
            console.info('自动生成标题 start')
            await threadP.summaryTitles().then(async (title) => {
              if (title) {
                console.info('自动生成标题', title)
                await threadP.renameConversation(cached.threadId, title)
                // 重新加载会话列表以更新标题
                await loadThreads(1)
              }
            })
          } catch (error) {
            console.error('自动生成标题失败:', error)
          }
        }
      } else {
        if (activeThreadId.value) generatingThreadIds.value.delete(activeThreadId.value)
      }
    }
  }

  const handleStreamError = async (msg: { eventId: string }) => {
    isGenerating.value = false

    // 从缓存中获取消息
    const cached = generatingMessagesCache.value.get(msg.eventId)
    if (cached) {
      // 如果是当前激活的会话，从数据库获取最新的消息状态
      if (cached.threadId === activeThreadId.value) {
        try {
          // 只获取出错的消息
          const updatedMessage = await threadP.getMessage(msg.eventId)
          // 在消息列表中找到并更新这条消息
          const messageIndex = messages.value.findIndex((m) => m.id === msg.eventId)
          if (messageIndex !== -1) {
            messages.value[messageIndex] = updatedMessage
          }
        } catch (error) {
          console.error('加载错误消息失败:', error)
        }
      }
      // 无论是否是当前激活的会话，都从缓存中移除该消息
      generatingMessagesCache.value.delete(msg.eventId)
    }
  }

  const renameThread = async (threadId: string, title: string) => {
    await threadP.renameConversation(threadId, title)
    loadThreads(1)
  }

  // 配置相关的方法
  const loadChatConfig = async () => {
    if (!activeThreadId.value) return
    try {
      const conversation = await threadP.getConversation(activeThreadId.value)
      const threadToUpdate = threads.value
        .flatMap((thread) => thread.dtThreads)
        .find((t) => t.id === activeThreadId.value)
      if (threadToUpdate) {
        Object.assign(threadToUpdate, conversation)
      }
      if (conversation) {
        chatConfig.value = { ...conversation.settings }
      }
    } catch (error) {
      console.error('加载对话配置失败:', error)
      throw error
    }
  }

  const saveChatConfig = async () => {
    if (!activeThreadId.value) return
    try {
      await threadP.updateConversationSettings(activeThreadId.value, chatConfig.value)
    } catch (error) {
      console.error('保存对话配置失败:', error)
      throw error
    }
  }

  const updateChatConfig = async (newConfig: Partial<CONVERSATION_SETTINGS>) => {
    chatConfig.value = { ...chatConfig.value, ...newConfig }
    await saveChatConfig()
    await loadChatConfig() // 加载对话配置
  }

  const deleteMessage = async (messageId: string) => {
    if (!activeThreadId.value) return
    try {
      await threadP.deleteMessage(messageId)
      loadMessages()
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }
  const cancelGenerating = async (threadId: string) => {
    if (!threadId) return
    try {
      // 找到当前正在生成的消息
      const generatingMessage = Array.from(generatingMessagesCache.value.entries()).find(
        ([, cached]) => cached.threadId === threadId
      )

      if (generatingMessage) {
        const [messageId] = generatingMessage
        await threadP.stopMessageGeneration(messageId)
        // 从缓存中移除消息
        generatingMessagesCache.value.delete(messageId)
        generatingThreadIds.value.delete(threadId)
        // 获取更新后的消息
        const updatedMessage = await threadP.getMessage(messageId)
        // 更新消息列表中的对应消息
        const messageIndex = messages.value.findIndex((msg) => msg.id === messageId)
        if (messageIndex !== -1) {
          messages.value[messageIndex] = updatedMessage
        }
      }
    } catch (error) {
      console.error('取消生成失败:', error)
    }
  }
  window.electron.ipcRenderer.on('conversation-activated', (_, msg) => {
    console.log('conversation-activated', msg)
    activeThreadId.value = msg.conversationId
    loadMessages()
    loadChatConfig() // 加载对话配置
  })

  return {
    renameThread,
    // 状态
    activeThreadId,
    threads,
    messages,
    isLoading,
    isGenerating,
    hasMore,
    generatingMessagesCache,
    generatingThreadIds,
    // Getters
    activeThread,
    // Actions
    loadThreads,
    createThread,
    setActiveThread,
    loadMessages,
    sendMessage,
    handleStreamResponse,
    handleStreamEnd,
    handleStreamError,
    // 导出配置相关的状态和方法
    chatConfig,
    loadChatConfig,
    saveChatConfig,
    updateChatConfig,
    retryMessage,
    deleteMessage,
    clearActiveThread,
    cancelGenerating
  }
})
