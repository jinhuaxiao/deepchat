<template>
  <div class="p-4 h-full flex flex-col">
    <h1 class="text-2xl font-bold mb-4">Profiles Management</h1>

    <!-- Add New Profile Button and Proxy Manager Button -->
    <div class="mb-4 flex justify-between">
      <Button @click="openAddProfileDialog">Add New Profile</Button>
      
      <Button variant="outline" @click="navigateToProxiesView">
        <Icon icon="lucide:globe" class="mr-2 h-4 w-4" />
        Manage Proxies
      </Button>
    </div>

    <!-- Profile List -->
    <div class="flex-1 overflow-y-auto">
      <p v-if="isLoading" class="text-muted-foreground">Loading profiles...</p>
      <p v-else-if="error" class="text-destructive">Error loading profiles: {{ error }}</p>
      <p v-else-if="profiles.length === 0" class="text-muted-foreground">No profiles found. Add one!</p>
      <ul v-else class="space-y-2">
        <li v-for="profile in profiles" :key="profile.id" class="p-3 border rounded-md flex justify-between items-center">
          <div>
            <span class="font-medium">{{ profile.name }}</span>
            <span v-if="profile.group" class="ml-2 text-xs bg-secondary text-secondary-foreground p-1 rounded">{{ profile.group }}</span>
            <p class="text-sm text-muted-foreground">ID: {{ profile.id }}</p>
            <p v-if="profile.proxyId" class="text-sm text-muted-foreground">
              Proxy: {{ getProxyName(profile.proxyId) }}
            </p>
          </div>
          <div class="space-x-2">
            <Button variant="outline" size="sm" @click="openEditProfileDialog(profile)">Edit</Button>
            <Button variant="outline" size="sm" @click="handleOpenProfile(profile.id)">Open</Button>
            <Button variant="destructive" size="sm" @click="handleDeleteProfile(profile.id)">Delete</Button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Profile Dialog -->
    <ProfileDialog 
      :is-open="profileDialogOpen" 
      :profile="selectedProfile"
      @update:is-open="profileDialogOpen = $event"
      @saved="handleProfileSaved"
    />

    <!-- Error Dialog -->
    <AlertDialog :open="!!errorDialogMessage" @update:open="errorDialogMessage = ''">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription>{{ errorDialogMessage }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button @click="errorDialogMessage = ''">Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePresenter } from '@/composables/usePresenter'
import { useRouter } from 'vue-router'
import type { Profile } from '../../../shared/types/profile'
import type { ProxyConfig } from '../../../shared/types/proxy'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import ProfileDialog from '@/components/profile/ProfileDialog.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const profilePresenter = usePresenter('profilePresenter')
const proxyPresenter = usePresenter('proxyPresenter')
const router = useRouter()

const profiles = ref<Profile[]>([])
const proxies = ref<ProxyConfig[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const profileDialogOpen = ref(false)
const selectedProfile = ref<Profile | undefined>(undefined)
const errorDialogMessage = ref('')

const fetchProfiles = async () => {
  isLoading.value = true
  error.value = null
  try {
    const fetchedProfiles = await profilePresenter.getAllProfiles()
    profiles.value = fetchedProfiles || [] // Ensure it's an array
    
    // Also fetch proxies for display
    const fetchedProxies = await proxyPresenter.getAllProxies()
    proxies.value = fetchedProxies || []
  } catch (err: any) {
    console.error("Error fetching profiles:", err)
    error.value = err.message || 'Failed to fetch profiles'
  } finally {
    isLoading.value = false
  }
}

const getProxyName = (proxyId: string): string => {
  const proxy = proxies.value.find(p => p.id === proxyId)
  return proxy ? `${proxy.name} (${proxy.type})` : 'Unknown proxy'
}

const handleOpenProfile = async (id: string) => {
  try {
    await profilePresenter.openProfile(id)
    // Optional: refresh list to show updated lastUsedAt time
    await fetchProfiles()
  } catch (err: any) {
    console.error("Error opening profile:", err)
    errorDialogMessage.value = err.message || 'Failed to open profile'
  }
}

const handleDeleteProfile = async (id: string) => {
  // Optional: Add a confirmation dialog here
  try {
    const success = await profilePresenter.deleteProfile(id)
    if (success) {
      await fetchProfiles() // Refresh the list
    } else {
      error.value = 'Profile not found or could not be deleted'
    }
  } catch (err: any) {
    console.error("Error deleting profile:", err)
    error.value = err.message || 'Failed to delete profile'
  }
}

const openAddProfileDialog = () => {
  selectedProfile.value = undefined
  profileDialogOpen.value = true
}

const openEditProfileDialog = (profile: Profile) => {
  selectedProfile.value = profile
  profileDialogOpen.value = true
}

const handleProfileSaved = async (profile: Profile) => {
  // Refresh the profile list
  await fetchProfiles()
}

const navigateToProxiesView = () => {
  router.push('/proxies')
}

onMounted(() => {
  fetchProfiles()
})
</script>

<style scoped>
/* Component-specific styles */
</style> 