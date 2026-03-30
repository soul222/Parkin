<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div class="max-w-md w-full text-center space-y-6 flex flex-col items-center">
      <div class="p-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full w-24 h-24 flex items-center justify-center shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div class="space-y-2">
        <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404</h1>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200">Halaman Tidak Ditemukan</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Maaf, halaman yang Anda tuju sepertinya telah dipindahkan atau tidak pernah ada.
        </p>
      </div>

      <router-link
        to="/dashboard/home"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>
