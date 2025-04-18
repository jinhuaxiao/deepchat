<template>
  <ScrollArea class="w-full h-full p-2">
    <div class="w-full h-full flex flex-col gap-1.5">
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:languages" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.language') }}</span>
        </span>
        <!-- 语言选择 -->
        <div class="flex-shrink-0 min-w-64 max-w-96">
          <Select v-model="selectedLanguage" class="">
            <SelectTrigger>
              <SelectValue :placeholder="t('settings.common.languageSelect')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                {{ lang.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <!-- 字体设置 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:type" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.fontFamily') || '字体样式' }}</span>
        </span>
        <div class="flex-shrink-0 min-w-64 max-w-96">
          <Select v-model="selectedFont" class="">
            <SelectTrigger>
              <SelectValue :placeholder="t('settings.common.selectFont') || '选择字体'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="font in fontOptions" :key="font.value" :value="font.value">
                {{ font.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <!-- 字体大小设置 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:text" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.fontSize') || '字体大小' }}</span>
        </span>
        <div class="flex-shrink-0 min-w-64 max-w-96">
          <div class="flex items-center gap-2">
            <Slider v-model="fontSizeValue" :min="12" :max="20" :step="1" class="flex-grow" />
            <span class="text-xs text-muted-foreground w-8 text-right">{{ fontSizeValue[0] }}px</span>
          </div>
        </div>
      </div>
      <!-- 搜索引擎选择 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:search" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.searchEngine') }}</span>
        </span>
        <div class="flex-shrink-0 flex gap-2">
          <div class="min-w-52 max-w-96">
            <Select v-model="selectedSearchEngine" class="">
              <SelectTrigger>
                <SelectValue :placeholder="t('settings.common.searchEngineSelect')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="engine in settingsStore.searchEngines"
                  :key="engine.id"
                  :value="engine.id"
                >
                  {{ engine.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            @click="openAddSearchEngineDialog"
            :title="t('settings.common.addCustomSearchEngine')"
          >
            <Icon icon="lucide:plus" class="w-4 h-4" />
          </Button>
          <Button
            v-if="isCurrentEngineCustom"
            variant="outline"
            size="icon"
            @click="currentEngine && openDeleteSearchEngineDialog(currentEngine)"
            :title="t('settings.common.deleteCustomSearchEngine')"
          >
            <Icon icon="lucide:trash-2" class="w-4 h-4 text-destructive" />
          </Button>
          <Button
            v-if="isCurrentEngineCustom"
            variant="outline"
            size="icon"
            @click="openTestSearchEngineDialog"
            :title="t('settings.common.testSearchEngine')"
          >
            <Icon icon="lucide:flask-conical" class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- 搜索助手模型选择 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:bot" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.searchAssistantModel') }}</span>
        </span>
        <div class="flex-shrink-0 min-w-64 max-w-96">
          <Popover v-model:open="modelSelectOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                <div class="flex items-center gap-2">
                  <ModelIcon :model-id="selectedSearchModel?.id || ''" class="h-4 w-4" />
                  <span class="truncate">{{
                    selectedSearchModel?.name || t('settings.common.selectModel')
                  }}</span>
                </div>
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-0">
              <ModelSelect @update:model="handleSearchModelSelect" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <!-- 代理模式选择 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:globe" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.proxyMode') }}</span>
        </span>
        <div class="flex-shrink-0 min-w-64 max-w-96">
          <Select v-model="selectedProxyMode" class="">
            <SelectTrigger>
              <SelectValue :placeholder="t('settings.common.proxyModeSelect')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="mode in proxyModes" :key="mode.value" :value="mode.value">
                {{ mode.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <!-- 浏览器路径设置 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:chrome" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.browserPath') || '浏览器路径' }}</span>
        </span>
        <div class="flex-shrink-0 flex gap-2 min-w-64 max-w-96">
          <Input
            v-model="browserPath"
            :placeholder="t('settings.common.browserPathPlaceholder') || '例如: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'"
          />
          <Button
            variant="outline"
            size="icon"
            @click="selectBrowserPath"
            :title="t('settings.common.selectBrowserPath') || '选择浏览器路径'"
          >
            <Icon icon="lucide:folder-open" class="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div v-if="selectedProxyMode === 'custom'" class="flex flex-col p-2 gap-2 px-2">
        <div class="flex flex-row items-center gap-2">
          <span class="flex flex-row items-center gap-2 flex-grow w-full">
            <Icon icon="lucide:link" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('settings.common.customProxyUrl') }}</span>
          </span>
          <div class="flex-shrink-0 min-w-64 max-w-96">
            <Input
              v-model="customProxyUrl"
              :placeholder="t('settings.common.customProxyUrlPlaceholder')"
              :class="{ 'border-red-500': showUrlError }"
              @input="validateProxyUrl"
              @blur="validateProxyUrl"
            />
          </div>
        </div>
        <div v-if="showUrlError" class="text-xs text-red-500 ml-6">
          {{ t('settings.common.invalidProxyUrl') }}
        </div>
      </div>
      <!-- artifacts效果开关 -->
      <!-- <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:sparkles" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">Artifacts</span>
        </span>
        <div class="flex-shrink-0">
          <Switch
            id="artifacts-effect-switch"
            :checked="artifactsEffectEnabled"
            @update:checked="(val) => settingsStore.setArtifactsEffectEnabled(Boolean(val))"
          />
        </div>
      </div> -->
      <!-- 搜索预览开关 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:eye" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.searchPreview') }}</span>
        </span>
        <div class="flex-shrink-0">
          <Switch
            id="search-preview-switch"
            :checked="searchPreviewEnabled"
            @update:checked="handleSearchPreviewChange"
          />
        </div>
      </div>
      <!-- 投屏保护开关 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:monitor" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{
            t('settings.common.contentProtection') || '投屏保护'
          }}</span>
        </span>
        <div class="flex-shrink-0">
          <Switch
            id="content-protection-switch"
            :checked="contentProtectionEnabled"
            @update:checked="handleContentProtectionChange"
          />
        </div>
      </div>

      <!-- 日志开关 -->
      <div class="flex flex-row p-2 items-center gap-2 px-2">
        <span class="flex flex-row items-center gap-2 flex-grow w-full">
          <Icon icon="lucide:file-text" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm font-medium">{{ t('settings.common.loggingEnabled') }}</span>
        </span>
        <div class="flex-shrink-0">
          <Switch
            id="logging-switch"
            :checked="loggingEnabled"
            @update:checked="handleLoggingChange"
          />
        </div>
      </div>

      <!-- 日志开关确认对话框 -->
      <Dialog :open="isLoggingDialogOpen" @update:open="cancelLoggingChange">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t('settings.common.loggingDialogTitle') }}</DialogTitle>
            <DialogDescription>
              <div class="space-y-2">
                <p>
                  {{
                    newLoggingValue
                      ? t('settings.common.loggingEnableDesc')
                      : t('settings.common.loggingDisableDesc')
                  }}
                </p>
                <p>{{ t('settings.common.loggingRestartNotice') }}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="cancelLoggingChange">{{ t('common.cancel') }}</Button>
            <Button @click="confirmLoggingChange">{{ t('common.confirm') }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div
        class="p-2 flex flex-row items-center gap-2 hover:bg-accent rounded-lg cursor-pointer"
        @click="openLogFolder"
      >
        <Icon icon="lucide:external-link" class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm font-medium">{{ t('settings.common.openLogFolder') }}</span>
      </div>
      <!-- 重置数据 -->
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <div
            class="p-2 flex flex-row items-center gap-2 hover:bg-accent rounded-lg cursor-pointer"
          >
            <Icon icon="lucide:trash" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('settings.common.resetData') }}</span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t('common.resetDataConfirmTitle') }}</DialogTitle>
            <DialogDescription>
              {{ t('common.resetDataConfirmDescription') }}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="closeDialog">
              {{ t('dialog.cancel') }}
            </Button>
            <Button variant="destructive" @click="handleResetData">
              {{ t('dialog.confirm') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ScrollArea>

  <!-- 添加自定义搜索引擎对话框 -->
  <Dialog v-model:open="isAddSearchEngineDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('settings.common.addCustomSearchEngine') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.common.addCustomSearchEngineDesc') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="search-engine-name" class="text-right">
            {{ t('settings.common.searchEngineName') }}
          </Label>
          <Input
            id="search-engine-name"
            v-model="newSearchEngine.name"
            class="col-span-3"
            :placeholder="t('settings.common.searchEngineNamePlaceholder')"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="search-engine-url" class="text-right">
            {{ t('settings.common.searchEngineUrl') }}
          </Label>
          <div class="col-span-3">
            <Input
              id="search-engine-url"
              v-model="newSearchEngine.searchUrl"
              :placeholder="t('settings.common.searchEngineUrlPlaceholder')"
              :class="{ 'border-red-500': showSearchUrlError }"
            />
            <div v-if="showSearchUrlError" class="text-xs text-red-500 mt-1">
              {{ t('settings.common.searchEngineUrlError') }}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="closeAddSearchEngineDialog">
          {{ t('dialog.cancel') }}
        </Button>
        <Button type="submit" :disabled="!isValidNewSearchEngine" @click="addCustomSearchEngine">
          {{ t('dialog.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 添加删除搜索引擎确认对话框 -->
  <Dialog v-model:open="isDeleteSearchEngineDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('settings.common.deleteCustomSearchEngine') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.common.deleteCustomSearchEngineDesc', { name: engineToDelete?.name }) }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="closeDeleteSearchEngineDialog">
          {{ t('dialog.cancel') }}
        </Button>
        <Button variant="destructive" @click="deleteCustomSearchEngine">
          {{ t('dialog.delete.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 投屏保护切换确认对话框 -->
  <Dialog v-model:open="isContentProtectionDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{
          t('settings.common.contentProtectionDialogTitle') || '确认切换投屏保护'
        }}</DialogTitle>
        <DialogDescription>
          <template v-if="newContentProtectionValue">
            {{ t('settings.common.contentProtectionEnableDesc') }}
          </template>
          <template v-else>
            {{ t('settings.common.contentProtectionDisableDesc') }}
          </template>
          <div class="mt-2 font-medium">
            {{ t('settings.common.contentProtectionRestartNotice') }}
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="cancelContentProtectionChange">
          {{ t('dialog.cancel') }}
        </Button>
        <Button
          :variant="newContentProtectionValue ? 'default' : 'destructive'"
          @click="confirmContentProtectionChange"
        >
          {{ t('dialog.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 测试搜索引擎确认对话框 -->
  <Dialog v-model:open="isTestSearchEngineDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('settings.common.testSearchEngine') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.common.testSearchEngineDesc', { engine: currentEngine?.name || '' }) }}
          <div class="mt-2">
            {{ t('settings.common.testSearchEngineNote') }}
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="closeTestSearchEngineDialog">
          {{ t('dialog.cancel') }}
        </Button>
        <Button @click="testSearchEngine">
          {{ t('dialog.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 自定义字体对话框 -->
  <Dialog v-model:open="isCustomFontDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('settings.common.customFontDialogTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.common.customFontDialogDescription') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="custom-font-name" class="text-right">
            {{ t('settings.common.customFontName') }}
          </Label>
          <Input
            id="custom-font-name"
            v-model="customFontName"
            class="col-span-3"
            :placeholder="t('settings.common.customFontNamePlaceholder')"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="custom-font-family" class="text-right">
            {{ t('settings.common.customFontFamily') }}
          </Label>
          <Input
            id="custom-font-family"
            v-model="customFontFamily"
            class="col-span-3"
            :placeholder="t('settings.common.customFontFamilyPlaceholder')"
          />
        </div>
        <div v-if="customFontFamily" class="p-4 border rounded-md">
          <p class="text-sm text-muted-foreground">{{ t('settings.common.fontPreview') }}:</p>
          <p :style="{ fontFamily: customFontFamily }" class="text-lg mt-2">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
            abcdefghijklmnopqrstuvwxyz<br>
            0123456789!@#$%^&*()
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="closeCustomFontDialog">
          {{ t('dialog.cancel') }}
        </Button>
        <Button @click="saveCustomFont" :disabled="!customFontName || !customFontFamily">
          {{ t('dialog.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePresenter } from '@/composables/usePresenter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ref, onMounted, watch, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown } from 'lucide-vue-next'
import ModelSelect from '@/components/ModelSelect.vue'
import ModelIcon from '@/components/icons/ModelIcon.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RENDERER_MODEL_META } from '@shared/presenter'
import type { SearchEngineTemplate } from '@shared/chat'
import { Switch } from '@/components/ui/switch'
import { nanoid } from 'nanoid'
import { Slider } from '@/components/ui/slider'

const devicePresenter = usePresenter('devicePresenter')
const configPresenter = usePresenter('configPresenter')
const settingsStore = useSettingsStore()
const { t } = useI18n()

// 添加字体相关状态
const selectedFont = ref('system')
const fontSizeValue = ref([14])

// 字体选项
const fontOptions = ref([
  { value: "system", label: t('settings.common.systemFont') || '系统默认' },
  { value: "'Source Han Sans SC', '-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", label: "思源黑体" },
  { value: "'Microsoft YaHei', sans-serif", label: "微软雅黑" },
  { value: "'PingFang SC', sans-serif", label: "苹方" },
  { value: "'SimSun', serif", label: "宋体" },
  { value: "'SimHei', sans-serif", label: "黑体" },
  { value: "'KaiTi', serif", label: "楷体" },
  { value: "'Arial', sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "monospace", label: "等宽字体" },
  // 添加Google手写风格字体
  { value: "'Caveat', cursive", label: "Caveat (手写)" },
  { value: "'Pacifico', cursive", label: "Pacifico (手写)" },
  { value: "'Dancing Script', cursive", label: "Dancing Script (手写)" },
  { value: "'Indie Flower', cursive", label: "Indie Flower (手写)" },
  { value: "'Shadows Into Light', cursive", label: "Shadows Into Light (手写)" },
  { value: "'Satisfy', cursive", label: "Satisfy (手写)" },
  { value: "'Kalam', cursive", label: "Kalam (手写)" },
  { value: "custom", label: t('settings.common.customFont') || '自定义字体' }
])

const selectedLanguage = ref('system')
const selectedSearchEngine = ref(settingsStore.activeSearchEngine?.id ?? 'google')
const selectedSearchModel = computed(() => settingsStore.searchAssistantModel)

const selectedProxyMode = ref('system')
const customProxyUrl = ref('')
const showUrlError = ref(false)
const browserPath = ref('')

// 新增搜索引擎相关
const isAddSearchEngineDialogOpen = ref(false)
const newSearchEngine = ref({
  name: '',
  searchUrl: ''
})
const showSearchUrlError = ref(false)

const isValidNewSearchEngine = computed(() => {
  return (
    newSearchEngine.value.name.trim() !== '' &&
    newSearchEngine.value.searchUrl.trim() !== '' &&
    newSearchEngine.value.searchUrl.includes('{query}')
  )
})

const openAddSearchEngineDialog = () => {
  newSearchEngine.value = {
    name: '',
    searchUrl: ''
  }
  showSearchUrlError.value = false
  isAddSearchEngineDialogOpen.value = true
}

const closeAddSearchEngineDialog = () => {
  isAddSearchEngineDialogOpen.value = false
}

const addCustomSearchEngine = async () => {
  if (!isValidNewSearchEngine.value) {
    if (!newSearchEngine.value.searchUrl.includes('{query}')) {
      showSearchUrlError.value = true
    }
    return
  }

  // 创建自定义搜索引擎对象
  const customEngine: SearchEngineTemplate = {
    id: `custom-${nanoid(6)}`,
    name: newSearchEngine.value.name.trim(),
    searchUrl: newSearchEngine.value.searchUrl.trim(),
    selector: '',
    extractorScript: '',
    isCustom: true
  }

  try {
    // 获取现有的自定义搜索引擎
    let customSearchEngines: SearchEngineTemplate[] = []
    try {
      customSearchEngines = (await configPresenter.getCustomSearchEngines()) || []
    } catch (error) {
      console.error('获取自定义搜索引擎失败:', error)
      customSearchEngines = []
    }

    // 添加新的自定义搜索引擎
    customSearchEngines.push(customEngine)

    // 保存自定义搜索引擎
    await configPresenter.setCustomSearchEngines(customSearchEngines)

    // 更新全局搜索引擎列表
    const allEngines = [
      ...settingsStore.searchEngines.filter((e) => !e.isCustom),
      ...customSearchEngines
    ]
    settingsStore.searchEngines.splice(0, settingsStore.searchEngines.length, ...allEngines)

    // 选择新添加的引擎
    selectedSearchEngine.value = customEngine.id
    await settingsStore.setSearchEngine(customEngine.id)

    closeAddSearchEngineDialog()
  } catch (error) {
    console.error('添加自定义搜索引擎失败:', error)
    // TODO: 显示错误提示
  }
}

let proxyUrlDebounceTimer: number | null = null

const languageOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'zh-TW', label: '繁體中文（台灣）' },
  { value: 'zh-HK', label: '繁體中文（香港）' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'fr-FR', label: 'Français' }
]

const proxyModes = [
  { value: 'system', label: t('settings.common.proxyModeSystem') },
  { value: 'none', label: t('settings.common.proxyModeNone') },
  { value: 'custom', label: t('settings.common.proxyModeCustom') }
]

const validateProxyUrl = () => {
  if (!customProxyUrl.value.trim()) {
    showUrlError.value = false
    return
  }

  const urlPattern =
    /^(http|https):\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(:[0-9]+)?(\/[^\s]*)?$/
  const isValid = urlPattern.test(customProxyUrl.value)

  showUrlError.value = !isValid

  if (isValid || !customProxyUrl.value.trim()) {
    configPresenter.setCustomProxyUrl(customProxyUrl.value)
  }
}

onMounted(async () => {
  selectedLanguage.value = settingsStore.language
  selectedSearchEngine.value = settingsStore.activeSearchEngine?.id ?? 'google'

  selectedProxyMode.value = await configPresenter.getProxyMode()
  customProxyUrl.value = await configPresenter.getCustomProxyUrl()
  browserPath.value = await configPresenter.getBrowserPath()
  
  // 加载自定义字体
  const customFonts = await configPresenter.getSetting<{value: string, label: string}[]>('customFonts')
  if (customFonts && customFonts.length > 0) {
    // 将自定义字体添加到字体选项中，但确保不重复添加
    customFonts.forEach(font => {
      if (!fontOptions.value.some(f => f.value === font.value)) {
        fontOptions.value.push(font)
      }
    })
  }
  
  // 加载字体设置
  const savedFont = await configPresenter.getSetting<string>('fontFamily')
  if (savedFont) {
    selectedFont.value = savedFont
    applyFontSettings()
  }
  
  // 加载字体大小设置
  const savedFontSize = await configPresenter.getSetting<string>('fontSize')
  if (savedFontSize) {
    fontSizeValue.value = [parseInt(savedFontSize) || 14]
    applyFontSettings()
  }
  
  if (selectedProxyMode.value === 'custom' && customProxyUrl.value) {
    validateProxyUrl()
  }
})

watch(selectedLanguage, async (newValue) => {
  console.log('selectedLanguage', newValue)
  await settingsStore.updateLanguage(newValue)
})

watch(selectedSearchEngine, async (newValue) => {
  await settingsStore.setSearchEngine(newValue)
})

watch(selectedProxyMode, (newValue) => {
  configPresenter.setProxyMode(newValue)
})

watch(customProxyUrl, () => {
  if (proxyUrlDebounceTimer !== null) {
    clearTimeout(proxyUrlDebounceTimer)
  }
  proxyUrlDebounceTimer = window.setTimeout(() => {
    validateProxyUrl()
  }, 300)
})

const isDialogOpen = ref(false)
const modelSelectOpen = ref(false)

const closeDialog = () => {
  isDialogOpen.value = false
}

const handleResetData = () => {
  devicePresenter.resetData()
  closeDialog()
}

const handleSearchModelSelect = (model: RENDERER_MODEL_META, providerId: string) => {
  console.log('update search model', model, providerId)
  settingsStore.setSearchAssistantModel(model, providerId)
  modelSelectOpen.value = false
}

const isDeleteSearchEngineDialogOpen = ref(false)
const engineToDelete = ref<SearchEngineTemplate | null>(null)

const openDeleteSearchEngineDialog = (engine: SearchEngineTemplate) => {
  engineToDelete.value = engine
  isDeleteSearchEngineDialogOpen.value = true
}

const closeDeleteSearchEngineDialog = () => {
  isDeleteSearchEngineDialogOpen.value = false
}

const deleteCustomSearchEngine = async () => {
  if (!engineToDelete.value) return

  try {
    // 获取现有的自定义搜索引擎
    let customSearchEngines: SearchEngineTemplate[] = []
    try {
      customSearchEngines = (await configPresenter.getCustomSearchEngines()) || []
    } catch (error) {
      console.error('获取自定义搜索引擎失败:', error)
      customSearchEngines = []
    }

    // 记录被删除的是否为当前选中的引擎
    const isDeletingActiveEngine = selectedSearchEngine.value === engineToDelete.value?.id

    // 过滤掉要删除的搜索引擎
    customSearchEngines = customSearchEngines.filter((e) => e.id !== engineToDelete.value?.id)

    // 保存自定义搜索引擎
    await configPresenter.setCustomSearchEngines(customSearchEngines)

    // 更新全局搜索引擎列表
    const allEngines = [
      ...settingsStore.searchEngines.filter((e) => !e.isCustom),
      ...customSearchEngines
    ]
    settingsStore.searchEngines.splice(0, settingsStore.searchEngines.length, ...allEngines)

    // 如果删除的是当前选中的引擎，则切换到第一个默认引擎
    if (isDeletingActiveEngine) {
      // 找到第一个默认引擎 (非自定义引擎)
      const firstDefaultEngine = settingsStore.searchEngines.find((e) => !e.isCustom)
      if (firstDefaultEngine) {
        selectedSearchEngine.value = firstDefaultEngine.id
        await settingsStore.setSearchEngine(firstDefaultEngine.id)
      }
    }

    closeDeleteSearchEngineDialog()
  } catch (error) {
    console.error('删除自定义搜索引擎失败:', error)
    // TODO: 显示错误提示
  }
}

// 获取当前选择的搜索引擎对象
const currentEngine = computed(() => {
  return (
    settingsStore.searchEngines.find((engine) => engine.id === selectedSearchEngine.value) || null
  )
})

// 判断当前选择的是否为自定义搜索引擎
const isCurrentEngineCustom = computed(() => {
  return currentEngine.value?.isCustom || false
})

// 搜索预览开关
const searchPreviewEnabled = computed({
  get: () => {
    return settingsStore.searchPreviewEnabled
  },
  set: (value) => {
    settingsStore.setSearchPreviewEnabled(value)
  }
})

// 投屏保护开关
const contentProtectionEnabled = computed({
  get: () => {
    return settingsStore.contentProtectionEnabled
  },
  set: (value) => {
    settingsStore.setContentProtectionEnabled(value)
  }
})

// 日志开关
const loggingEnabled = computed({
  get: () => {
    return settingsStore.loggingEnabled
  },
  set: (value) => {
    settingsStore.setLoggingEnabled(value)
  }
})

// 处理搜索预览状态变更
const handleSearchPreviewChange = (value: boolean) => {
  console.log('切换搜索预览状态:', value)
  settingsStore.setSearchPreviewEnabled(value)
}

// 处理投屏保护状态变更
const handleContentProtectionChange = (value: boolean) => {
  console.log('准备切换投屏保护状态:', value)
  // 显示确认对话框
  newContentProtectionValue.value = value
  isContentProtectionDialogOpen.value = true
}

// 日志开关相关
const isLoggingDialogOpen = ref(false)
const newLoggingValue = ref(false)

// 处理日志开关状态变更
const handleLoggingChange = (value: boolean) => {
  console.log('准备切换日志状态:', value)
  // 显示确认对话框
  newLoggingValue.value = value
  isLoggingDialogOpen.value = true
}

const cancelLoggingChange = () => {
  isLoggingDialogOpen.value = false
}

const confirmLoggingChange = () => {
  settingsStore.setLoggingEnabled(newLoggingValue.value)
  isLoggingDialogOpen.value = false
}

const openLogFolder = () => {
  configPresenter.openLoggingFolder()
}

// 投屏保护切换确认对话框
const isContentProtectionDialogOpen = ref(false)
const newContentProtectionValue = ref(false)

const cancelContentProtectionChange = () => {
  isContentProtectionDialogOpen.value = false
}

const confirmContentProtectionChange = () => {
  settingsStore.setContentProtectionEnabled(newContentProtectionValue.value)
  isContentProtectionDialogOpen.value = false
}

// 测试搜索引擎相关
const isTestSearchEngineDialogOpen = ref(false)

const openTestSearchEngineDialog = () => {
  isTestSearchEngineDialogOpen.value = true
}

const closeTestSearchEngineDialog = () => {
  isTestSearchEngineDialogOpen.value = false
}

const testSearchEngine = async () => {
  try {
    settingsStore.testSearchEngine('天气')
    closeTestSearchEngineDialog()
  } catch (error) {
    console.error('测试搜索引擎失败:', error)
  }
}

// 选择浏览器路径
const selectBrowserPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('dialog:openFile', {
      title: t('settings.common.selectBrowserPath') || '选择浏览器路径',
      filters: [
        { name: 'Executables', extensions: ['exe'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      browserPath.value = result.filePaths[0]
      await saveBrowserPath()
    }
  } catch (error) {
    console.error('Failed to select browser path:', error)
  }
}

// 保存浏览器路径
const saveBrowserPath = async () => {
  try {
    await configPresenter.setBrowserPath(browserPath.value)
  } catch (error) {
    console.error('Failed to save browser path:', error)
  }
}

// 监听浏览器路径变化
watch(browserPath, async (newPath) => {
  if (newPath !== await configPresenter.getBrowserPath()) {
    await saveBrowserPath()
  }
})

// 监视字体变化
watch(selectedFont, async (newFont) => {
  if (newFont === 'custom') {
    // 打开自定义字体对话框
    openCustomFontDialog()
    return
  }
  
  await configPresenter.setSetting('fontFamily', newFont)
  applyFontSettings()
})

// 监视字体大小变化
watch(fontSizeValue, async (newSize) => {
  await configPresenter.setSetting('fontSize', newSize[0].toString())
  applyFontSettings()
})

// 应用字体设置到CSS变量
const applyFontSettings = () => {
  const root = document.documentElement
  
  // 设置字体
  if (selectedFont.value === "system") {
    root.style.removeProperty('--font-family')
  } else {
    root.style.setProperty('--font-family', selectedFont.value)
  }
  
  // 设置字体大小
  root.style.setProperty('--font-size', `${fontSizeValue.value[0]}px`)
  
  // 触发 CSS 变量更新事件，确保所有组件更新
  window.dispatchEvent(new Event('fontSettingsChanged'))
}

// 确保初始化时就执行一次
applyFontSettings()

// 添加自定义字体状态
const isCustomFontDialogOpen = ref(false)
const customFontName = ref('')
const customFontFamily = ref('')

// 打开自定义字体对话框
const openCustomFontDialog = () => {
  customFontName.value = ''
  customFontFamily.value = ''
  
  // 保存之前的字体以便取消时恢复
  const prevFont = fontOptions.value.find(f => 
    f.value !== 'custom' && f.value === selectedFont.value
  )?.value || 'system'
  
  // 保存恢复字体值
  localStorage.setItem('prev-font', prevFont)
  
  isCustomFontDialogOpen.value = true
}

// 处理字体对话框关闭
const closeCustomFontDialog = () => {
  isCustomFontDialogOpen.value = false
  // 恢复原来的字体设置
  const prevFont = localStorage.getItem('prev-font') || 'system'
  selectedFont.value = prevFont
}

// 保存自定义字体
const saveCustomFont = async () => {
  if (!customFontName.value || !customFontFamily.value) return
  
  // 构造自定义字体对象
  const customFontValue = customFontFamily.value

  // 添加到字体选项列表
  const existingIndex = fontOptions.value.findIndex(f => f.value === customFontValue)
  
  if (existingIndex >= 0) {
    // 更新已存在的自定义字体
    fontOptions.value[existingIndex].label = customFontName.value
  } else {
    // 添加新的自定义字体
    fontOptions.value.push({
      value: customFontValue,
      label: customFontName.value
    })
  }

  // 自定义字体记录类型
  type CustomFont = {value: string, label: string}
  
  // 获取现有的自定义字体
  const existingCustomFonts = await configPresenter.getSetting<CustomFont[]>('customFonts') || []
  
  // 添加新的自定义字体
  const updatedCustomFonts = [...existingCustomFonts, {
    value: customFontValue, 
    label: customFontName.value
  }]
  
  // 保存自定义字体到配置中
  await configPresenter.setSetting('customFonts', updatedCustomFonts)
  
  // 设置当前选中的字体为自定义字体
  selectedFont.value = customFontValue
  await configPresenter.setSetting('fontFamily', customFontValue)
  applyFontSettings()
  
  closeCustomFontDialog()
}
</script>

<style>
/* 添加手写字体的预览支持 */
.preview-caveat {
  font-family: 'Caveat', cursive;
}
.preview-pacifico {
  font-family: 'Pacifico', cursive;
}
.preview-dancing-script {
  font-family: 'Dancing Script', cursive;
}
.preview-indie-flower {
  font-family: 'Indie Flower', cursive;
}
.preview-shadows-into-light {
  font-family: 'Shadows Into Light', cursive;
}
.preview-satisfy {
  font-family: 'Satisfy', cursive;
}
.preview-kalam {
  font-family: 'Kalam', cursive;
}
.preview-jetbrains-mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
