<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Edit Proxy' : 'Add Proxy' }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Update proxy configuration details.' : 'Set up a new proxy configuration.' }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Name</Label>
          <Input id="name" v-model="proxyForm.name" class="col-span-3" placeholder="My Proxy" />
        </div>
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="proxy-type" class="text-right">Type</Label>
          <Select v-model="proxyForm.type" class="col-span-3">
            <SelectTrigger>
              <SelectValue placeholder="Select proxy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="https">HTTPS</SelectItem>
              <SelectItem value="socks4">SOCKS4</SelectItem>
              <SelectItem value="socks5">SOCKS5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div v-if="proxyForm.type !== 'none'" class="space-y-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="proxy-host" class="text-right">Host</Label>
            <Input id="proxy-host" v-model="proxyForm.host" class="col-span-3" placeholder="example.com" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="proxy-port" class="text-right">Port</Label>
            <Input id="proxy-port" v-model="proxyForm.port" type="number" class="col-span-3" placeholder="8080" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="proxy-username" class="text-right">Username</Label>
            <Input id="proxy-username" v-model="proxyForm.username" class="col-span-3" placeholder="Optional" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="proxy-password" class="text-right">Password</Label>
            <Input id="proxy-password" v-model="proxyForm.password" type="password" class="col-span-3" placeholder="Optional" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="cancelDialog">Cancel</Button>
        <Button type="submit" @click="saveProxy">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProxyConfig } from '../../../../shared/types/proxy'
import { usePresenter } from '@/composables/usePresenter'

const props = defineProps<{
  isOpen: boolean
  proxy?: ProxyConfig
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'saved': [proxy: ProxyConfig]
}>()

const proxyPresenter = usePresenter('proxyPresenter')

const isEditing = computed(() => !!props.proxy)

// Default empty proxy form
const proxyForm = ref({
  id: '',
  name: '',
  type: 'none' as 'none' | 'http' | 'https' | 'socks4' | 'socks5',
  host: '',
  port: 0,
  username: '',
  password: '',
  createdAt: 0,
  lastUsedAt: 0
})

// Watch for changes in the proxy prop to update the form
watch(() => props.proxy, (newProxy) => {
  if (newProxy) {
    proxyForm.value = {
      id: newProxy.id,
      name: newProxy.name,
      type: newProxy.type,
      host: newProxy.host,
      port: newProxy.port,
      username: newProxy.username || '',
      password: newProxy.password || '',
      createdAt: newProxy.createdAt,
      lastUsedAt: newProxy.lastUsedAt || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  proxyForm.value = {
    id: '',
    name: '',
    type: 'none' as const,
    host: '',
    port: 0,
    username: '',
    password: '',
    createdAt: 0,
    lastUsedAt: 0
  }
}

async function saveProxy() {
  try {
    let result: ProxyConfig;
    
    // Format the data for the API
    const proxyData = {
      name: proxyForm.value.name,
      type: proxyForm.value.type,
      host: proxyForm.value.host,
      port: proxyForm.value.port,
      username: proxyForm.value.username || undefined,
      password: proxyForm.value.password || undefined
    };
    
    if (isEditing.value && props.proxy) {
      // Update existing proxy
      const updatedProxy = await proxyPresenter.updateProxy(props.proxy.id, proxyData);
      
      if (!updatedProxy) {
        throw new Error('Failed to update proxy');
      }
      
      result = updatedProxy;
    } else {
      // Create new proxy
      result = await proxyPresenter.createProxy(proxyData);
    }
    
    emit('saved', result);
    emit('update:isOpen', false);
  } catch (error) {
    console.error('Failed to save proxy:', error);
    // Here you could add error handling, e.g., display an error message to the user
  }
}

function cancelDialog() {
  emit('update:isOpen', false)
}

function onOpenChange(open: boolean) {
  emit('update:isOpen', open)
}
</script> 