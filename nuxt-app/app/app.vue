<script setup lang="ts">
const config = useRuntimeConfig();
const appName = config.public.appName;

useHead({
  titleTemplate(title) {
    return title ? `%s - ${appName}` : appName;
  },
});
</script>

<template>
  <NuxtLoadingIndicator />
  <Wrapper>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Wrapper>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-right-enter-active {
  transition: 0.3s ease;
  /* position: absolute;
  width: 100%; */
}

.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-enter-to {
  transform: translateX(0);
}
/* .slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(-100%);
} */

.slide-right-enter-from {
  transform: translateX(-100%);
}
.slide-right-enter-to {
  transform: translateX(0);
}
/* .slide-right-leave-from {
  transform: translateX(0);
}
.slide-right-leave-to {
  transform: translateX(100%);
} */
</style>
