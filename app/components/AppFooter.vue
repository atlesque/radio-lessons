<script setup lang="ts">
const { t } = useLang();
</script>

<template>
  <footer class="border-t border-default">
    <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs leading-relaxed text-muted">
      <p>
        {{ t({ en: 'Key sequences follow the Icom IC-R5 instruction manual. Listening rules follow BIPT\'s position on scanners. FM frequencies are VRT\'s published list. Everything else you hear in the simulator is a practice signal.', nl: 'De toetscombinaties volgen de handleiding van de Icom IC-R5. De luisterregels volgen het standpunt van het BIPT over scanners. De FM-frequenties zijn de gepubliceerde lijst van VRT. Al het andere in de simulator is een oefensignaal.' }) }}
      </p>
      <p>
        {{ t({ en: 'An independent learning project, not affiliated with Icom Inc. Icom and IC-R5 are trademarks of Icom Inc.', nl: 'Een onafhankelijk leerproject, niet verbonden aan Icom Inc. Icom en IC-R5 zijn handelsmerken van Icom Inc.' }) }}
        <a href="https://github.com/atlesque/radio-lessons" target="_blank" rel="noopener" class="underline underline-offset-2">GitHub</a>
      </p>
    </div>
  </footer>
</template>
