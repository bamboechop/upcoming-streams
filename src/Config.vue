<template>
  <section class="grid lg:grid-cols-[1fr_340px] gap-[24px] p-[16px] relative">
    <ConfigMain
      :amount-of-schedule-items="config.amountOfScheduleItems"
      :background-color="config.backgroundColor"
      :countdown-background-color="config.countdownBackgroundColor"
      :countdown-font-color="config.countdownFontColor"
      :day-border-color="config.dayBorderColor"
      :font-color="config.fontColor"
      :font-family="config.fontFamily"
      :font-size="config.fontSize"
      :header-background-color="config.headerBackgroundColor"
      :header-font-color="config.headerFontColor"
      :panel-title="config.panelTitle"
      :schedule-button-background-color="config.scheduleButtonBackgroundColor"
      :schedule-button-font-color="config.scheduleButtonFontColor"
      :show-category="config.showCategory"
      :show-category-background-image="config.showCategoryBackgroundImage"
      :show-category-image="config.showCategoryImage"
      :show-countdown="config.showCountdown"
      :show-header="config.showHeader"
      :show-success-message="showSuccessMessage"
      :show-sticky-footer="config.showStickyFooter"
      :show-time-zone-inline="config.showTimeZoneInline"
      :show-times="config.showTimes"
      :show-title="config.showTitle"
      :show-usernames="config.showUsernames"
      :time-font-color="config.timeFontColor"
      :theme="config.theme"
      :vacation-background-color="config.vacationBackgroundColor"
      :vacation-font-color="config.vacationFontColor"
      @save-config="save"
      @update:amount-of-schedule-items="config.amountOfScheduleItems = $event"
      @update:background-color="config.backgroundColor = $event"
      @update:countdown-background-color="config.countdownBackgroundColor = $event"
      @update:countdown-font-color="config.countdownFontColor = $event"
      @update:day-border-color="config.dayBorderColor = $event"
      @update:font-color="config.fontColor = $event"
      @update:font-family="config.fontFamily = $event"
      @update:font-size="config.fontSize = $event"
      @update:header-background-color="config.headerBackgroundColor = $event"
      @update:header-font-color="config.headerFontColor = $event"
      @update:panel-title="config.panelTitle = $event"
      @update:schedule-button-background-color="config.scheduleButtonBackgroundColor = $event"
      @update:schedule-button-font-color="config.scheduleButtonFontColor = $event"
      @update:selected-view="selectedView = $event"
      @update:show-category="config.showCategory = $event"
      @update:show-category-background-image="config.showCategoryBackgroundImage = $event"
      @update:show-category-image="config.showCategoryImage = $event"
      @update:show-countdown="config.showCountdown = $event"
      @update:show-header="config.showHeader = $event"
      @update:show-sticky-footer="config.showStickyFooter = $event"
      @update:show-time-zone-inline="config.showTimeZoneInline = $event"
      @update:show-times="config.showTimes = $event"
      @update:show-title="config.showTitle = $event"
      @update:show-usernames="config.showUsernames = $event"
      @update:theme="handleThemeChange"
      @update:time-font-color="config.timeFontColor = $event"
      @update:vacation-background-color="config.vacationBackgroundColor = $event"
      @update:vacation-font-color="config.vacationFontColor = $event" />
    <ConfigPreview
      :background-color="config.backgroundColor"
      :countdown-background-color="config.countdownBackgroundColor"
      :countdown-font-color="config.countdownFontColor"
      :day-border-color="config.dayBorderColor"
      :font-color="config.fontColor"
      :font-family="config.fontFamily"
      :font-size="config.fontSize"
      :header-background-color="config.headerBackgroundColor"
      :header-font-color="config.headerFontColor"
      :panel-title="config.panelTitle"
      :schedule-button-background-color="config.scheduleButtonBackgroundColor"
      :schedule-button-font-color="config.scheduleButtonFontColor"
      :selected-view="selectedView"
      :show-category="config.showCategory"
      :show-category-background-image="config.showCategoryBackgroundImage"
      :show-category-image="config.showCategoryImage"
      :show-countdown="config.showCountdown"
      :show-header="config.showHeader"
      :show-sticky-footer="config.showStickyFooter"
      :show-time-zone-inline="config.showTimeZoneInline"
      :show-times="config.showTimes"
      :show-title="config.showTitle"
      :show-usernames="config.showUsernames"
      :theme="config.theme"
      :time-font-color="config.timeFontColor"
      :vacation-background-color="config.vacationBackgroundColor"
      :vacation-font-color="config.vacationFontColor" />
    <template v-if="showUpdateOverlay">
      <UpdateOverlay @close="handleUpdateOverlayClose" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTwitch } from '@/composables/twitch.composable'
import ConfigMain from './components/config/ConfigMain.vue'
import ConfigPreview from './components/config/ConfigPreview.vue'
import type { TwitchExtensionTheme } from './common/interfaces/twitch.interface'
import UpdateOverlay from './components/update-overlay/UpdateOverlay.vue'
import { version } from '../package.json'

const { config, saveConfig, updateTheme } = useTwitch()
const showSuccessMessage = ref(false)
const selectedView = ref<'general' | 'appearance' | 'typography'>('general')

const shouldShowUpdateOverlay = computed(() => {
  const lastSeenVersion = config.value.lastSeenVersion
  return !lastSeenVersion || lastSeenVersion !== version
})

const showUpdateOverlay = ref(shouldShowUpdateOverlay.value)

const handleThemeChange = (theme: TwitchExtensionTheme) => {
  updateTheme(theme)
}

const handleUpdateOverlayClose = async () => {
  config.value.lastSeenVersion = version
  await saveConfig()
  showUpdateOverlay.value = false
}

watch(shouldShowUpdateOverlay, (newValue) => {
  showUpdateOverlay.value = newValue
})

const save = () => {
  try {
    saveConfig()
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Error saving config:', error)
  }
}


</script>
