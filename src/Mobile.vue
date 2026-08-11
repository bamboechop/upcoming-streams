<template>
  <div class="flex w-screen h-screen items-center justify-center">
    <template v-if="!twitchLoading">
      <PanelMain
        :background-color="config.backgroundColor"
        :broadcaster-name="broadcasterName"
        :countdown-background-color="config.countdownBackgroundColor"
        :countdown-font-color="config.countdownFontColor"
        :day-border-color="config.dayBorderColor"
        :font-color="config.fontColor"
        :font-family="config.fontFamily"
        :font-size="config.fontSize"
        :header-background-color="config.headerBackgroundColor"
        :header-font-color="config.headerFontColor"
        :is-live="isLive"
        is-mobile
        :panel-title="config.panelTitle"
        :schedule-button-background-color="config.scheduleButtonBackgroundColor"
        :schedule-button-font-color="config.scheduleButtonFontColor"
        :schedule-items="schedule"
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
        :start-live-polling="startLivePolling"
        :stop-live-polling="stopLivePolling"
        :time-font-color="config.timeFontColor"
        :vacation="vacation"
        :vacation-background-color="config.vacationBackgroundColor"
        :vacation-font-color="config.vacationFontColor" />
    </template>
    <template v-if="twitchLoading">
      <CustomLoader />
    </template>
  </div>
</template>

<script setup lang="ts">
import PanelMain from './components/panel/PanelMain.vue';
import CustomLoader from './components/common/CustomLoader.vue';
import { useTwitch } from './composables/twitch.composable';

const { broadcasterName, config, isLive, schedule, twitchLoading, vacation, startLivePolling, stopLivePolling } = useTwitch();
</script>
