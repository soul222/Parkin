<template>
  <div 
    class="skeleton-shimmer"
    :style="{
      width: width,
      height: height,
      borderRadius: borderRadius
    }"
    :class="customClass"
  ></div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  borderRadius: {
    type: String,
    default: '0.375rem' // Rounded-md equivalent
  },
  customClass: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.skeleton-shimmer {
  display: inline-block;
  background-color: var(--skeleton-base, #e2e8f0);
  background-image: linear-gradient(
    90deg,
    var(--skeleton-base, #e2e8f0) 0px,
    var(--skeleton-highlight, #f8fafc) 40px,
    var(--skeleton-base, #e2e8f0) 80px
  );
  background-size: 300px 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.5s infinite linear;
}

/* Dark mode support using Tailwind's .dark class conventions */
:global(.dark) .skeleton-shimmer {
  --skeleton-base: #334155;
  --skeleton-highlight: #475569;
}

@keyframes shimmer {
  0% { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}
</style>
