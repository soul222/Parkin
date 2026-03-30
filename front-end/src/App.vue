<template>
  <SplashTransition />
  <RouteTransitionLoader />
  <InstallPrompt />
  <router-view />
  <ToastAlert />
</template>

<script setup>
import InstallPrompt from './components/InstallPrompt.vue'
import RouteTransitionLoader from './components/RouteTransitionLoader.vue'
import SplashTransition from './components/SplashTransition.vue'
import ToastAlert from './components/ToastAlert.vue'
</script>