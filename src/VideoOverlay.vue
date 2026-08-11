<template>
  <div class="bg-(--extension-color-background) border-(--extension-color-day-border) border-4 border-l-0 flex max-h-twitch-iframe-height max-w-[322px] items-center justify-center w-full mb-12 h-[calc(100%-96px)]">
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
        :panel-title="config.panelTitle"
        :schedule-button-background-color="config.scheduleButtonBackgroundColor"
        :schedule-button-font-color="config.scheduleButtonFontColor"
        :schedule-items="schedule"
        :show-category="config.showCategory"
        :show-category-background-image="config.showCategoryBackgroundImage"
        :show-category-image="config.showCategoryImage"
        :show-countdown="config.showCountdown"
        :show-header="config.showHeader"
        show-minimize-button
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

<style>
body.body-video-overlay {
  background: transparent;
}

#video_overlay {
  align-items: end;
  display: flex;
  height: 100%;
}
</style>
