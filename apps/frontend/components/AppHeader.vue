<template>
  <header
    class="sticky top-0 z-50 border-b"
    style="
      background: rgba(2, 0, 10, 0.85);
      backdrop-filter: blur(20px);
      border-color: rgba(174, 119, 213, 0.15);
    "
  >
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-glow"
            style="background: linear-gradient(135deg, #7e4eac, #532d84)"
          >
            <span class="text-white text-xs font-bold font-display">W</span>
          </div>
          <div class="flex flex-col">
            <span
              class="font-display text-white font-semibold text-sm leading-none"
              >WAHT</span
            >
            <span class="text-arcane-100 text-xs leading-none hidden sm:block"
              >AH Tracker</span
            >
          </div>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-void-300/30 transition-all duration-200"
            active-class="text-arcane-50 bg-arcane-300/20"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Auth -->
        <div class="flex items-center gap-3">
          <!-- Connecté -->
          <div v-if="user" class="flex items-center gap-3">
            <NuxtLink
              to="/dashboard"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-arcane-300/20"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style="background: linear-gradient(135deg, #7e4eac, #532d84)"
              >
                {{ user.battletag[0] }}
              </div>
              <span class="text-sm text-gray-300 hidden sm:block">{{
                user.battletag
              }}</span>
            </NuxtLink>
            <button
              class="text-gray-500 hover:text-red-400 transition-colors text-sm"
              @click="logout"
            >
              Logout
            </button>
          </div>

          <!-- Non connecté -->
          <div v-else class="flex items-center gap-2">
            <button
              class="text-gray-400 hover:text-white text-sm transition-colors"
              @click="login('eu')"
            >
              EU
            </button>
            <span class="text-gray-700">|</span>
            <button
              class="text-gray-400 hover:text-white text-sm transition-colors"
              @click="login('us')"
            >
              US
            </button>
            <button class="btn-primary text-sm ml-2" @click="login('eu')">
              Connect Battle.net
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, login, logout } = useAuth();

const navItems = [
  { label: "Search", path: "/search" },
  { label: "Realms", path: "/realms" },
  { label: "Dashboard", path: "/dashboard" },
];
</script>
