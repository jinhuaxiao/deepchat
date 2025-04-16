<template>
  <div class="w-full h-full relative min-h-0">
    <div
      ref="messagesContainer"
      class="relative flex-1 overflow-y-auto scroll-smooth w-full h-full"
      @scroll="handleScroll"
    >
      <div
        ref="messageList"
        class="w-full max-w-full break-all xl:max-w-3xl mx-auto px-4 py-8 transition-opacity duration-300"
        :class="{ 'opacity-0': !visible }"
      >
        <template v-for="(msg, index) in messages" :key="index">
          <div class="message-item-container mb-8 transition-all duration-200">
            <MessageItemAssistant
              v-if="msg.role === 'assistant'"
              :key="index"
              :message="msg"
              :ref="setAssistantRef(index)"
              class="message-item"
            />
            <MessageItemUser
              v-if="msg.role === 'user'"
              :key="index"
              :message="msg"
              @retry="handleRetry(index)"
              class="message-item"
            />
          </div>
        </template>
      </div>
      <div ref="scrollAnchor" class="h-10" />
    </div>
    
    <div v-if="showCancelButton" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
      <Button variant="destructive" size="sm" class="rounded-full px-4 shadow-md flex items-center gap-2 animate-pulse-subtle" @click="handleCancel">
        <Icon icon="lucide:square" class="w-4 h-4" />
        <span>{{ t('common.cancel') }}</span>
      </Button>
    </div>
    
    <div
      v-else
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
    >
      <Button variant="secondary" size="sm" class="rounded-full px-4 shadow-md" @click="createNewThread">
        <Icon icon="lucide:plus" class="w-4 h-4 mr-1" />
        <span>{{ t('common.newChat') }}</span>
      </Button>
      
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <Button
          v-if="aboveThreshold"
          variant="outline"
          size="icon"
          class="w-8 h-8 rounded-full shadow-md bg-white/80 dark:bg-[#13131a]/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary"
          @click="scrollToBottom(true)"
        >
          <Icon icon="lucide:arrow-down" class="w-4 h-4" />
        </Button>
      </transition>
    </div>
    
    <ReferencePreview
      class="pointer-events-none"
      :show="referenceStore.showPreview"
      :content="referenceStore.currentReference"
      :rect="referenceStore.previewRect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed, reactive } from 'vue'
import MessageItemAssistant from './MessageItemAssistant.vue'
import MessageItemUser from './MessageItemUser.vue'
import { AssistantMessage, UserMessage } from '@shared/chat'
import { useElementBounding, useDebounceFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/stores/chat'
import { useI18n } from 'vue-i18n'
import { useReferenceStore } from '@/stores/reference'
import ReferencePreview from './ReferencePreview.vue'
const { t } = useI18n()
const props = defineProps<{
  messages: UserMessage[] | AssistantMessage[]
}>()

const referenceStore = useReferenceStore()

const messagesContainer = ref<HTMLDivElement>()
const messageList = ref<HTMLDivElement>()
const scrollAnchor = ref<HTMLDivElement>()
const visible = ref(false)
const chatStore = useChatStore()
// Store refs as Record to avoid type checking issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assistantRefs = reactive<Record<number, any>>({})

// Helper function to set refs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setAssistantRef = (index: number) => (el: any) => {
  if (el) {
    assistantRefs[index] = el
  }
}
const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    scrollAnchor.value?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'end'
    })
  })
}

const aboveThreshold = ref(false)
const SCROLL_THRESHOLD = 100
const handleScroll = useDebounceFn((event) => {
  const rect = messageList.value?.getBoundingClientRect()
  const container = event.target
  if (rect?.height) {
    const scrollBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    aboveThreshold.value = scrollBottom > SCROLL_THRESHOLD
  }
}, 100)

// 创建新会话
const createNewThread = async () => {
  try {
    await chatStore.clearActiveThread()
  } catch (error) {
    console.error(t('common.error.createChatFailed'), error)
  }
}

const showCancelButton = computed(() => {
  return chatStore.generatingThreadIds.has(chatStore.activeThreadId ?? '')
})

const handleCancel = () => {
  if (!chatStore.activeThreadId) return
  chatStore.cancelGenerating(chatStore.activeThreadId)
}

// Handle retry event from MessageItemUser
const handleRetry = (index: number) => {
  // Find the next assistant message after this user message
  for (let i = index + 1; i < props.messages.length; i++) {
    if (props.messages[i].role === 'assistant') {
      try {
        const assistantRef = assistantRefs[i]
        if (assistantRef && typeof assistantRef.handleAction === 'function') {
          assistantRef.handleAction('retry')
          break
        }
      } catch (error) {
        console.error('Failed to trigger retry action:', error)
      }
    }
  }
}

defineExpose({
  scrollToBottom,
  aboveThreshold
})

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      scrollToBottom()
      nextTick(() => {
        visible.value = true
      })
    }, 10)
    const { height } = useElementBounding(messageList.value)
    watch(
      () => height.value,
      () => {
        const lastMessage = props.messages[props.messages.length - 1]
        if (lastMessage?.status === 'pending' && !aboveThreshold.value) {
          scrollToBottom()
        }
      }
    )
  })
})
</script>

<style scoped>
.message-item {
  transform-origin: bottom;
  animation: messageAppear 0.3s ease-out forwards;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
