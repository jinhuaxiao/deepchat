// Use CommonJS require for electron-store to avoid ESM issues
const Store = require('electron-store')
import { Profile } from '../../shared/types/profile'
import { v4 as uuidv4 } from 'uuid'

// Define the structure of our store data
interface StoreSchema {
  profiles: Profile[]
}

class ProfileManager {
  private store: any

  constructor() {
    this.store = new Store({
      name: 'browser-profiles',
      defaults: {
        profiles: []
      }
    })
  }

  getAllProfiles(): Profile[] {
    return this.store.get('profiles', [])
  }

  getProfileById(id: string): Profile | undefined {
    const profiles = this.getAllProfiles()
    return profiles.find((p) => p.id === id)
  }

  createProfile(profileData: Omit<Profile, 'id' | 'createdAt'>): Profile {
    const profiles = this.getAllProfiles()
    const newProfile: Profile = {
      ...profileData,
      id: uuidv4(),
      createdAt: Date.now()
    }
    profiles.push(newProfile)
    this.store.set('profiles', profiles)
    return newProfile
  }

  updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | undefined {
    const profiles = this.getAllProfiles()
    const profileIndex = profiles.findIndex((p) => p.id === id)

    if (profileIndex === -1) {
      console.error(`[ProfileManager] Profile with id ${id} not found for update.`)
      return undefined
    }

    const updatedProfile = {
      ...profiles[profileIndex],
      ...updates
    }

    profiles[profileIndex] = updatedProfile
    this.store.set('profiles', profiles)
    return updatedProfile
  }

  deleteProfile(id: string): boolean {
    const profiles = this.getAllProfiles()
    const initialLength = profiles.length
    const filteredProfiles = profiles.filter((p) => p.id !== id)

    if (filteredProfiles.length < initialLength) {
      this.store.set('profiles', filteredProfiles)
      return true
    } else {
      console.warn(`[ProfileManager] Profile with id ${id} not found for deletion.`)
      return false
    }
  }
}

// Export a singleton instance
export const profileManager = new ProfileManager()
