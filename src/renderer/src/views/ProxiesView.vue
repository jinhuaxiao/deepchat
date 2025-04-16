<template>
  <div class="p-4 h-full flex flex-col">
    <h1 class="text-2xl font-bold mb-4">Proxy Management</h1>

    <!-- Add New Proxy Button -->
    <div class="mb-4">
      <Button @click="openAddProxyDialog">Add New Proxy</Button>
    </div>

    <!-- Proxy List -->
    <div class="flex-1 overflow-y-auto">
      <p v-if="isLoading" class="text-muted-foreground">Loading proxies...</p>
      <p v-else-if="error" class="text-destructive">Error loading proxies: {{ error }}</p>
      <p v-else-if="proxies.length === 0" class="text-muted-foreground">No proxies found. Add one!</p>
      <ul v-else class="space-y-2">
        <li v-for="proxy in proxies" :key="proxy.id" class="p-3 border rounded-md flex justify-between items-center">
          <div>
            <span class="font-medium">{{ proxy.name }}</span>
            <span class="ml-2 text-xs bg-secondary text-secondary-foreground p-1 rounded">{{ proxy.type }}</span>
            <p class="text-sm text-muted-foreground">{{ proxy.host }}:{{ proxy.port }}</p>
            <p v-if="proxy.username" class="text-sm text-muted-foreground">
              Auth: {{ proxy.username }}
            </p>
          </div>
          <div class="space-x-2">
            <Button variant="outline" size="sm" @click="openEditProxyDialog(proxy)">Edit</Button>
            <Button 
              variant="destructive" 
              size="sm" 
              @click="handleDeleteProxy(proxy.id)"
              :disabled="proxyInUse(proxy.id)"
              :title="proxyInUse(proxy.id) ? 'This proxy is in use by profiles' : 'Delete proxy'"
            >
              Delete
            </Button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Proxy Dialog -->
    <ProxyDialog 
      :is-open="proxyDialogOpen" 
      :proxy="selectedProxy"
      @update:is-open="proxyDialogOpen = $event"
      @saved="handleProxySaved"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePresenter } from '@/composables/usePresenter'
import type { ProxyConfig } from '../../../shared/types/proxy'
import { Button } from '@/components/ui/button'
import ProxyDialog from '@/components/proxy/ProxyDialog.vue'

const proxyPresenter = usePresenter('proxyPresenter')

const proxies = ref<ProxyConfig[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const proxyDialogOpen = ref(false)
const selectedProxy = ref<ProxyConfig | undefined>(undefined)

const fetchProxies = async () => {
  isLoading.value = true
  error.value = null
  try {
    const fetchedProxies = await proxyPresenter.getAllProxies()
    proxies.value = fetchedProxies || [] // Ensure it's an array
  } catch (err: any) {
    console.error("Error fetching proxies:", err)
    error.value = err.message || 'Failed to fetch proxies'
  } finally {
    isLoading.value = false
  }
}

const proxyInUse = (id: string) => {
  try {
    return proxyPresenter.isProxyInUse(id)
  } catch (err) {
    console.error("Error checking if proxy is in use:", err)
    return false // Default to allowing deletion
  }
}

const handleDeleteProxy = async (id: string) => {
  // Optional: Add a confirmation dialog here
  try {
    // Don't allow deletion if proxy is in use
    if (proxyInUse(id)) {
      error.value = 'Cannot delete proxy that is in use by profiles'
      return
    }
    
    const success = await proxyPresenter.deleteProxy(id)
    if (success) {
      await fetchProxies() // Refresh the list
    } else {
      error.value = 'Failed to delete proxy'
    }
  } catch (err: any) {
    console.error("Error deleting proxy:", err)
    error.value = err.message || 'Failed to delete proxy'
  }
}

const openAddProxyDialog = () => {
  selectedProxy.value = undefined
  proxyDialogOpen.value = true
}

const openEditProxyDialog = (proxy: ProxyConfig) => {
  selectedProxy.value = proxy
  proxyDialogOpen.value = true
}

const handleProxySaved = async (proxy: ProxyConfig) => {
  // Refresh the proxy list
  await fetchProxies()
}

onMounted(() => {
  fetchProxies()
})
</script> 