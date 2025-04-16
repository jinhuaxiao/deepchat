import { createRouter, createWebHashHistory } from 'vue-router'
import ProxiesView from '@/views/ProxiesView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: () => import('@/views/ChatTabView.vue'),
      meta: {
        titleKey: 'routes.chat',
        icon: 'lucide:message-square'
      }
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('@/views/ProfilesView.vue'),
      meta: {
        titleKey: 'routes.profiles',
        icon: 'lucide:users'
      }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
      meta: {
        titleKey: 'routes.welcome',
        icon: 'lucide:message-square'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsTabView.vue'),
      meta: {
        titleKey: 'routes.settings',
        icon: 'lucide:settings'
      },
      children: [
        {
          path: 'common',
          name: 'settings-common',
          component: () => import('@/components/settings/CommonSettings.vue'),
          meta: {
            titleKey: 'routes.settings-common',
            icon: 'lucide:bolt'
          }
        },
        {
          path: 'provider/:providerId?',
          name: 'settings-provider',
          component: () => import('@/components/settings/ModelProviderSettings.vue'),
          meta: {
            titleKey: 'routes.settings-provider',
            icon: 'lucide:cloud-cog'
          }
        },
        {
          path: 'mcp',
          name: 'settings-mcp',
          component: () => import('@/components/settings/McpSettings.vue'),
          meta: {
            titleKey: 'routes.settings-mcp',
            icon: 'lucide:server'
          }
        },
        {
          path: 'database',
          name: 'settings-database',
          component: () => import('@/components/settings/DataSettings.vue'),
          meta: {
            titleKey: 'routes.settings-database',
            icon: 'lucide:database'
          }
        },
        {
          path: 'shortcut',
          name: 'settings-shortcut',
          component: () => import('@/components/settings/ShortcutSettings.vue'),
          meta: {
            titleKey: 'routes.settings-shortcut',
            icon: 'lucide:keyboard'
          }
        },
        {
          path: 'about',
          name: 'settings-about',
          component: () => import('@/components/settings/AboutUsSettings.vue'),
          meta: {
            titleKey: 'routes.settings-about',
            icon: 'lucide:info'
          }
        }
      ]
    },
    {
      path: '/proxies',
      name: 'proxies',
      component: ProxiesView
    }
  ]
})

export default router
