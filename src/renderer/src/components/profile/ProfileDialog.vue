<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Edit Profile' : 'Create Profile' }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Update profile details below.' : 'Fill in profile details below to create a new browser profile.' }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Name</Label>
          <Input id="name" v-model="profileForm.name" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="group" class="text-right">Group</Label>
          <Input id="group" v-model="profileForm.group" class="col-span-3" placeholder="Optional" />
        </div>
        
        <!-- Proxy Selection -->
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="proxy" class="text-right">Proxy</Label>
          <div class="col-span-3 flex gap-2">
            <Select v-model="profileForm.proxyId" class="flex-1">
              <SelectTrigger>
                <SelectValue placeholder="Select proxy configuration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Proxy</SelectItem>
                <SelectItem v-for="proxy in proxies" :key="proxy.id" :value="proxy.id">
                  {{ proxy.name }} ({{ proxy.type }})
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" @click="openProxyManager">
              <Icon icon="lucide:settings" class="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="user-agent" class="text-right">User Agent</Label>
          <Input id="user-agent" v-model="profileForm.userAgent" class="col-span-3" placeholder="Optional" />
        </div>
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="notes" class="text-right">Notes</Label>
          <Textarea id="notes" v-model="profileForm.notes" class="col-span-3" placeholder="Optional" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="cancelDialog">Cancel</Button>
        <Button type="submit" @click="saveProfile">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/vue'
import type { Profile } from '../../../../shared/types/profile'
import type { ProxyConfig } from '../../../../shared/types/proxy'
import { usePresenter } from '@/composables/usePresenter'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isOpen: boolean
  profile?: Profile
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'saved': [profile: Profile]
}>()

const profilePresenter = usePresenter('profilePresenter')
const proxyPresenter = usePresenter('proxyPresenter')
const router = useRouter()

const isEditing = computed(() => !!props.profile)
const proxies = ref<ProxyConfig[]>([])

// Default empty profile form
const profileForm = ref({
  id: '',
  name: '',
  group: '',
  proxyId: 'none',
  userAgent: '',
  notes: '',
  createdAt: 0,
  lastUsedAt: 0
})

// Watch for changes in the profile prop to update the form
watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    profileForm.value = {
      id: newProfile.id,
      name: newProfile.name,
      group: newProfile.group || '',
      proxyId: newProfile.proxyId || 'none',
      userAgent: newProfile.userAgent || '',
      notes: newProfile.notes || '',
      createdAt: newProfile.createdAt,
      lastUsedAt: newProfile.lastUsedAt || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  profileForm.value = {
    id: '',
    name: '',
    group: '',
    proxyId: 'none',
    userAgent: '',
    notes: '',
    createdAt: 0,
    lastUsedAt: 0
  }
}

async function fetchProxies() {
  try {
    const fetchedProxies = await proxyPresenter.getAllProxies()
    proxies.value = fetchedProxies || []
  } catch (err) {
    console.error('Failed to fetch proxies:', err)
  }
}

async function saveProfile() {
  try {
    let result: Profile;
    
    // 处理proxyId，如果是"none"则设为undefined
    const proxyId = profileForm.value.proxyId === 'none' ? undefined : profileForm.value.proxyId;
    
    if (isEditing.value && props.profile) {
      // Update existing profile
      const updatedProfile = await profilePresenter.updateProfile(props.profile.id, {
        name: profileForm.value.name,
        group: profileForm.value.group || undefined,
        proxyId: proxyId,
        userAgent: profileForm.value.userAgent || undefined,
        notes: profileForm.value.notes || undefined
      });
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }
      
      result = updatedProfile;
    } else {
      // Create new profile
      result = await profilePresenter.createProfile({
        name: profileForm.value.name,
        group: profileForm.value.group || undefined,
        proxyId: proxyId,
        userAgent: profileForm.value.userAgent || undefined,
        notes: profileForm.value.notes || undefined
      });
    }
    
    emit('saved', result);
    emit('update:isOpen', false);
  } catch (error) {
    console.error('Failed to save profile:', error);
    // Here you could add error handling, e.g., display an error message to the user
  }
}

function cancelDialog() {
  emit('update:isOpen', false)
}

function onOpenChange(open: boolean) {
  emit('update:isOpen', open)
}

function openProxyManager() {
  // Close this dialog and navigate to proxy management
  emit('update:isOpen', false)
  router.push('/proxies')
}

onMounted(() => {
  fetchProxies()
})
</script> 