<template>
  <div class="flex p-2 flex-col items-center border-r border-border/50 bg-background-super-200 shadow-sm transition-all duration-200 h-full">
    <!-- Navigation Items -->
    <nav class="flex flex-1 flex-col gap-3 mt-2">
      <!-- Chat Section -->
      <Button
        variant="ghost"
        size="icon"
        class="rounded-xl w-10 h-10 transition-all duration-200 hover:scale-105"
        :class="[modelValue === 'chat' ? 'bg-primary/10 text-primary shadow-sm' : '']"
        @click="$emit('update:modelValue', 'chat')"
      >
        <div class="relative">
          <Icon
            icon="lucide:message-circle"
            :class="['h-5 w-5', modelValue === 'chat' ? 'text-primary' : 'text-muted-foreground']"
          />
          <span v-if="modelValue === 'chat'" class="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary"></span>
        </div>
        <span class="sr-only">Chat</span>
      </Button>

      <!-- Profiles Section -->
      <Button
        variant="ghost"
        size="icon"
        class="rounded-xl w-10 h-10 transition-all duration-200 hover:scale-105"
        :class="[modelValue === 'profiles' ? 'bg-primary/10 text-primary shadow-sm' : '']"
        @click="$emit('update:modelValue', 'profiles')"
      >
        <div class="relative">
          <Icon
            icon="lucide:globe"
            :class="['h-5 w-5', modelValue === 'profiles' ? 'text-primary' : 'text-muted-foreground']"
          />
          <span v-if="modelValue === 'profiles'" class="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary"></span>
        </div>
        <span class="sr-only">Profiles</span>
      </Button>

      <!-- Settings Section -->
      <Button
        variant="ghost"
        size="icon"
        class="rounded-xl w-10 h-10 transition-all duration-200 hover:scale-105"
        :class="[modelValue === 'settings' ? 'bg-primary/10 text-primary shadow-sm' : '']"
        @click="$emit('update:modelValue', 'settings')"
      >
        <div class="relative">
          <Icon
            icon="lucide:bolt"
            :class="['h-5 w-5', modelValue === 'settings' ? 'text-primary' : 'text-muted-foreground']"
          />
          <span v-if="modelValue === 'settings'" class="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary"></span>
        </div>
        <span class="sr-only">Settings</span>
      </Button>
    </nav>
    <!-- User Profile Section -->
    <div class="mt-auto relative flex flex-col items-center gap-3 mb-2">
      <Button
        variant="ghost"
        size="icon"
        class="w-10 h-10 rounded-xl text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/10"
        @click="toggleDark()"
      >
        <transition name="theme-switch" mode="out-in">
          <Icon v-if="isDark" icon="lucide:sun" class="w-5 h-5" key="sun" />
          <Icon v-else icon="lucide:moon" class="w-5 h-5" key="moon" />
        </transition>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-xl w-10 h-10 text-muted-foreground relative transition-all duration-200 hover:scale-105 hover:bg-primary/10"
        @click="handleProfileClick"
      >
        <Icon icon="lucide:user" class="h-5 w-5" />
        <span
          v-if="settings.hasUpdate"
          class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-glow"
        ></span>
        <span class="sr-only">User Profile</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'
import { onMounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const settings = useSettingsStore()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const handleProfileClick = async () => {
  if (!settings.hasUpdate) {
    await settings.checkUpdate()
  } else {
    settings.openUpdateDialog()
  }
}

// 监听更新状态变化，当有新更新时自动显示更新弹窗
watch(
  () => settings.hasUpdate,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      settings.openUpdateDialog()
    }
  }
)

onMounted(() => {
  settings.checkUpdate()
})
</script>

<style scoped>
.theme-switch-enter-active,
.theme-switch-leave-active {
  transition: all 0.2s ease-in-out;
}

.theme-switch-enter-from,
.theme-switch-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(30deg);
}

.shadow-glow {
  box-shadow: 0 0 5px 1px rgba(239, 68, 68, 0.7);
}
</style>
