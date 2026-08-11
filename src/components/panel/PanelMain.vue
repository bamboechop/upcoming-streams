<template>
  <component
    :is="tag"
    class="relative font-(--extension-font-family) flex flex-col h-full mx-auto w-full bg-(--extension-color-background) text-(--extension-color-text)">
    <template v-if="showHeader">
      <h1 class="bg-(--extension-color-header-background) text-2xl font-bold p-3 text-(--extension-color-header-font-color)">{{ panelTitle || t('schedule.title') }}</h1>
    </template>
    <div class="flex-1 overflow-auto">
      <div
        class="flex flex-col gap-y-4 p-3">
        <template v-if="vacation">
          <div class="flex flex-col gap-y-2 p-4 pt-3 rounded-md border"
            :style="{
              backgroundColor: `${vacationBackgroundColor}1A`,
              borderColor: `${vacationBackgroundColor}33`
            }">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold" :style="{ color: vacationFontColor }">{{ t('schedule.onVacation') }}</h2>
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-sm" :style="{ color: vacationFontColor, opacity: 0.9 }">
                {{ t('schedule.vacationMessage', {
                  streamerName: broadcasterName,
                  start: formatDate(vacation.start_time),
                  end: formatDate(vacation.end_time, { day: '2-digit', month: '2-digit', year: 'numeric' }),
                }) }}
              </p>
            </div>
          </div>
        </template>
        <template v-if="scheduleItems.length > 0">
          <template v-if="showCountdown">
            <div
              class="flex flex-col items-center justify-center mb-2 p-4 rounded-md border"
              :class="{ 'pt-2': countdownState === 'countdown', }"
              :style="{
                backgroundColor: `${countdownBackgroundColor}1A`,
                borderColor: `${countdownBackgroundColor}33`
              }">
              <template v-if="countdownState === 'countdown'">
                <p class="text-sm uppercase tracking-tight opacity-85 font-bold" :style="{ color: countdownFontColor }">{{ t('schedule.countdown.title') }}</p>
                <div class="flex items-center gap-x-4">
                  <template v-if="countdown.days > 0">
                    <p class="countdown-label countdown-days" :style="{ color: countdownFontColor }">{{ countdown.days.toString().padStart(2, '0') }}</p>
                    <p class="text-xs">:</p>
                  </template>
                  <template v-if="countdown.hours > 0 || countdown.days > 0">
                    <p class="countdown-label countdown-hours" :style="{ color: countdownFontColor }">{{ countdown.hours.toString().padStart(2, '0') }}</p>
                    <p class="text-xs">:</p>
                  </template>
                  <template v-if="countdown.minutes > 0 || countdown.hours > 0">
                    <p class="countdown-label countdown-minutes" :style="{ color: countdownFontColor }">{{ countdown.minutes.toString().padStart(2, '0') }}</p>
                    <p class="text-xs">:</p>
                  </template>
                  <p class="countdown-label countdown-seconds" :style="{ color: countdownFontColor }">{{ countdown.seconds.toString().padStart(2, '0') }}</p>
                </div>
              </template>
              <template v-else-if="countdownState === 'grace'">
                <p class="text-sm text-center font-bold text-balance" :style="{ color: countdownFontColor }">
                  {{ t('schedule.countdown.gracePeriod', { streamerName: broadcasterName }) }}
                </p>
              </template>
              <template v-else-if="countdownState === 'live'">
                <div class="flex items-center gap-x-2">
                  <Radio class="text-red-500 animate-pulse" :size="fontSize + 4" />
                  <p class="text-sm text-center font-bold leading-none text-balance" :style="{ color: countdownFontColor }">
                    {{ t('schedule.countdown.live', { streamerName: broadcasterName }) }}
                  </p>
                </div>
              </template>
            </div>
          </template>
          <template v-for="group in scheduleItems" :key="group.date">
            <div class="flex flex-col">
              <div class="flex items-center gap-x-2">
                <h2 class="text-md font-bold opacity-75 uppercase">{{ formatDay(group.items[0].start_time) }} <span class="text-sm">({{ formatDate(group.items[0].start_time) }})</span></h2>
                <hr class="bg-(--extension-color-day-border) h-[2px] border-0 grow" />
              </div>
              <div class="flex flex-col gap-y-2">
                <template v-for="item in group.items" :key="item.id">
                  <div
                    class="grid gap-x-3 bg-cover bg-center bg-no-repeat bg-blend-soft-light bg-(--extension-color-background)/85 rounded-md"
                    :class="[itemGridColumnClass, { 'p-1': showCategoryBackgroundImage }]"
                    :style="{
                      'background-image': showCategoryBackgroundImage && item.category?.image_url?.startsWith('https://') ? `url(${item.category?.image_url})` : undefined,
                    }">
                    <template v-if="showCategoryImage">
                      <img
                        v-if="item.category?.image_url?.startsWith('https://')"
                        :src="item.category.image_url"
                        :alt="item.category.name"
                        class="object-cover border-2 border-(--extension-color-day-border) rounded-sm" />
                      <template v-else>
                        <span></span>
                      </template>
                    </template>
                    <div class="flex flex-col grow gap-y-1 min-w-0">
                      <template v-if="showTimes">
                        <div class="text-xs italic text-(--extension-color-time-font-color) flex items-stat gap-x-1 justify-end text-right mr-1">
                          <AlarmClock class="mt-[2px] shrink-0" :size="fontSize * 0.75" />
                          {{ formatTime(item.start_time) }}
                          <template v-if="item.end_time">
                            - {{ formatTime(item.end_time) }}
                          </template>
                        </div>
                      </template>
                      <template v-if="showTitle && item.title">
                        <h3 class="text-lg font-bold">{{ item.title }}</h3>
                      </template>
                      <template v-if="showCategory && item.category">
                        <div class="flex items-center gap-x-2 min-w-0">
                          <Tag class="shrink-0" :size="fontSize" />
                          <h4
                            class="font-bold"
                            :class="{ 'text-lg': !showTitle, 'text-md': showTitle, 'text-xs': showCategoryImage }">
                            {{ item.category.name }}
                          </h4>
                        </div>
                      </template>
                      <template v-if="showUsernames && item.usernames.length > 0">
                        <div class="flex items-center gap-x-2">
                          <User class="shrink-0" :size="fontSize" />
                          <p class="text-xs">
                            {{ item.usernames.join(', ') }}
                          </p>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
        <template v-if="scheduleItems.length === 0">
          <p class="text-center text-gray-500">{{ t('schedule.noStreams') }}</p>
        </template>
      </div>
    </div>
    <div
      v-if="showStickyFooter || showMinimizeButton"
      :class="showStickyFooter
        ? 'sticky bottom-0 left-0 right-0 flex flex-col gap-y-1 items-center justify-center px-3 py-2 bg-(--extension-color-background) shadow-[0_-4px_6px_rgba(0,0,0,0.25)]'
        : 'contents'">
      <template v-if="showStickyFooter">
        <p class="flex items-center gap-x-1 text-xs text-(--extension-color-text)">
          <AlarmClock class="shrink-0" :size="fontSize * 0.75" />
          {{ t('schedule.timesInLocalTimezone') }}
        </p>
        <template v-if="scheduleLink && !isMobile">
          <button
            class="bg-(--extension-color-schedule-button-background) cursor-pointer text-(--extension-color-schedule-button-font-color) font-semibold text-xs flex items-center gap-x-1 px-4 py-2 rounded-md"
            type="button"
            @click="openSchedule">
            {{ t('schedule.viewFullSchedule') }}
          </button>
        </template>
      </template>
      <template v-if="showMinimizeButton">
        <button
          class="absolute bg-(--extension-color-day-border) px-2 py-1 bottom-0 right-0 z-1 cursor-pointer text-(--extension-color-schedule-button-font-color) font-semibold text-xs rounded-tl-md"
          type="button"
          @click="minimize">
          <SquareX :size="fontSize" />
        </button>
      </template>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useNow, useUrlSearchParams } from '@vueuse/core';
import { useI18n } from 'vue-i18n'
import { AlarmClock, Radio, SquareX, Tag, User } from '@lucide/vue'
import type { CountdownState, GroupedScheduleItem, TwitchUrlSearchParams, TwitchStreamScheduleResponse } from '@/common/interfaces/twitch.interface'

const { t } = useI18n({ useScope: 'global' })

const {
  backgroundColor,
  broadcasterName,
  countdownBackgroundColor,
  countdownFontColor,
  countdownStateOverride,
  dayBorderColor,
  fontColor,
  fontFamily,
  fontSize,
  headerBackgroundColor,
  headerFontColor,
  isLive = false,
  isMobile = false,
  scheduleButtonBackgroundColor,
  scheduleButtonFontColor,
  scheduleItems,
  showCategory,
  showCategoryBackgroundImage,
  showCategoryImage,
  showCountdown,
  showMinimizeButton = false,
  showTimeZoneInline,
  showTimes,
  showTitle,
  showUsernames,
  startLivePolling,
  stopLivePolling,
  tag = 'main',
  timeFontColor,
  vacation,
  vacationBackgroundColor,
  vacationFontColor,
} = defineProps<{
  backgroundColor: string
  broadcasterName: string
  countdownBackgroundColor: string
  countdownFontColor: string
  countdownStateOverride?: CountdownState
  dayBorderColor: string
  fontColor: string
  fontFamily: string
  fontSize: number
  headerBackgroundColor: string
  headerFontColor: string
  isLive?: boolean
  isMobile?: boolean
  panelTitle: string
  scheduleButtonBackgroundColor: string
  scheduleButtonFontColor: string
  scheduleItems: GroupedScheduleItem[]
  showCategory: boolean
  showCategoryBackgroundImage: boolean
  showCategoryImage: boolean
  showCountdown: boolean
  showHeader: boolean
  showMinimizeButton?: boolean
  showStickyFooter: boolean
  showTimeZoneInline: boolean
  showTimes: boolean
  showTitle: boolean
  showUsernames: boolean
  startLivePolling?: () => void
  stopLivePolling?: () => void
  tag?: string
  timeFontColor: string
  vacation: TwitchStreamScheduleResponse['data']['vacation']
  vacationBackgroundColor: string
  vacationFontColor: string
}>()

const urlParams = useUrlSearchParams<TwitchUrlSearchParams>('history');

const countdownTranslations = computed(() => {
  // We need to wrap the translations in quotes to prevent them from being interpreted as CSS variables
  return {
    days: `"${t('schedule.countdown.days')}"`,
    hours: `"${t('schedule.countdown.hours')}"`,
    minutes: `"${t('schedule.countdown.minutes')}"`,
    seconds: `"${t('schedule.countdown.seconds')}"`,
  };
})

const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    ...options
  };
  return new Date(dateString).toLocaleDateString(urlParams.locale, defaultOptions);
}

const formatDay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(urlParams.locale, {
    weekday: 'long',
  });
}

const formatTime = (dateTimeString: string) => {
  return new Date(dateTimeString).toLocaleTimeString(urlParams.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !urlParams.locale.startsWith('de'),
    ...(showTimeZoneInline ? { timeZoneName: 'short' as const } : {}),
  });
}

const minimize = () => {
  window.Twitch.ext.actions.minimize();
}

const now = useNow({ interval: 1000 });
const GRACE_PERIOD_MS = 30 * 60 * 1000;

const allItems = computed(() =>
  scheduleItems.flatMap(group => group.items),
);

const nextStreamStartTime = computed<Date | null>(() => {
  const item = allItems.value.find(item => new Date(item.start_time) > now.value);
  return item ? new Date(item.start_time) : null;
});

const graceTarget = computed<Date | null>(() => {
  for (const item of allItems.value) {
    const start = new Date(item.start_time);
    const elapsed = now.value.getTime() - start.getTime();
    if (elapsed >= 0 && elapsed <= GRACE_PERIOD_MS) return start;
  }
  return null;
});

const countdownState = computed<CountdownState>(() => {
  if (countdownStateOverride) return countdownStateOverride;
  if (isLive) return 'live';
  if (graceTarget.value) return 'grace';
  return 'countdown';
});

const countdown = computed(() => {
  if (!showCountdown || countdownState.value !== 'countdown') {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  if (!nextStreamStartTime.value) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = nextStreamStartTime.value.getTime() - now.value.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
});

watch(countdownState, (state, oldState) => {
  if (state === 'grace' || state === 'live') {
    startLivePolling?.();
  } else if (oldState === 'grace' || oldState === 'live') {
    stopLivePolling?.();
  }
}, { immediate: true });

onUnmounted(() => {
  stopLivePolling?.();
});

const scheduleLink = computed(() => {
  return `https://www.twitch.tv/${broadcasterName}/schedule`
})

/* static returned class strings to allow Tailwind to pick them up and provide the utility classes necessary */
const itemGridColumnClass = computed(() => {
  if (showCategoryImage) {
    return 'grid-cols-[74px_minmax(0,_1fr)]';
  }
  return 'grid-cols-[minmax(0,_1fr)]';
});

function openSchedule() {
  window.open(scheduleLink.value, '_blank')
}

watch(() => backgroundColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-background', value)
}, { immediate: true })

watch(() => dayBorderColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-day-border', value)
}, { immediate: true })

watch(() => fontColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-text', value)
}, { immediate: true })

watch(() => fontFamily, (value) => {
  const googleFont = document.getElementById('googleFont')
  if (googleFont) {
    (googleFont as HTMLLinkElement).href = `https://fonts.googleapis.com/css2?family=${value.replace(' ', '+')}:wght@400;500;700&display=swap`
  }
  document.documentElement.style.setProperty('--extension-font-family', `${value}, sans-serif`)
}, { immediate: true })

watch(() => fontSize, (value) => {
  document.documentElement.style.setProperty('--extension-font-size', `${value}px`)
}, { immediate: true })

watch(() => headerBackgroundColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-header-background', value)
}, { immediate: true })

watch(() => headerFontColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-header-font-color', value)
}, { immediate: true })

watch(() => scheduleButtonBackgroundColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-schedule-button-background', value)
}, { immediate: true })

watch(() => scheduleButtonFontColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-schedule-button-font-color', value)
}, { immediate: true })

watch(() => timeFontColor, (value) => {
  document.documentElement.style.setProperty('--extension-color-time-font-color', value)
}, { immediate: true })
</script>

<style scoped>
@reference 'tailwindcss';

.countdown-label {
  @apply relative text-xl font-bold after:text-(--extension-color-time-font-color) after:font-normal after:absolute after:-mb-2 after:bottom-0 after:text-[8px] after:left-1/2 after:-translate-x-1/2 after:uppercase;
}

.countdown-days::after {
  --tw-content: v-bind('countdownTranslations.days');
}
.countdown-hours::after {
  --tw-content: v-bind('countdownTranslations.hours');
}
.countdown-minutes::after {
  --tw-content: v-bind('countdownTranslations.minutes');
}
.countdown-seconds::after {
  --tw-content: v-bind('countdownTranslations.seconds');
}
</style>
