<template>
  <Dialog :open="isOpen" @update:open="onClose">
    <DialogContent class="max-h-[80vh] overflow-auto">
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
            v-model="localFontName"
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
            v-model="localFontFamily"
            class="col-span-3"
            :placeholder="t('settings.common.customFontFamilyPlaceholder')"
          />
        </div>
        <div v-if="systemFonts.length > 0" class="mt-2">
          <Label class="mb-2 block">{{ t('settings.common.selectFromSystemFonts') }}</Label>
          <ScrollArea class="h-[200px] rounded-md border">
            <div class="p-2">
              <div
                v-for="font in systemFonts"
                :key="font"
                class="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                @click="selectSystemFont(font)"
              >
                <span :style="{ fontFamily: font }">{{ font }}</span>
              </div>
            </div>
          </ScrollArea>
        </div>
        <div v-if="localFontFamily" class="p-4 border rounded-md">
          <p class="text-sm text-muted-foreground">{{ t('settings.common.fontPreview') }}:</p>
          <p :style="{ fontFamily: localFontFamily }" class="text-lg mt-2">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
            abcdefghijklmnopqrstuvwxyz<br>
            0123456789!@#$%^&*()
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="onClose">{{ t('dialog.cancel') }}</Button>
        <Button @click="onSave" :disabled="!isValid">{{ t('dialog.confirm') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

const { t } = useI18n()

interface Props {
  isOpen: boolean
  fontName?: string
  fontFamily?: string
  systemFonts?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  fontName: '',
  fontFamily: '',
  systemFonts: () => []
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', fontName: string, fontFamily: string): void
}>()

const localFontName = ref(props.fontName)
const localFontFamily = ref(props.fontFamily)

// 当props变化时更新本地状态
watch(() => props.fontName, (newVal) => { localFontName.value = newVal })
watch(() => props.fontFamily, (newVal) => { localFontFamily.value = newVal })

const isValid = computed(() => {
  return !!localFontName.value && !!localFontFamily.value
})

const onClose = () => {
  emit('update:open', false)
}

const onSave = () => {
  if (isValid.value) {
    emit('save', localFontName.value, localFontFamily.value)
    emit('update:open', false)
  }
}

const selectSystemFont = (font: string) => {
  localFontFamily.value = `'${font}', sans-serif`
  if (!localFontName.value) {
    localFontName.value = font
  }
}
</script> 