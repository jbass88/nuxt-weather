<template>
  <UApp>
    <div class="min-h-screen bg-[var(--body)] text-[var(--txt)] transition-colors duration-300">

      <div class="mx-auto max-w-screen-lg bg-[var(--surface)]">
        <UiNavHeader />
        
        <main class="max-w-3xl mx-auto p-6">
          <NuxtPage />
        </main>
      </div>
    </div>
  </UApp>  
</template>