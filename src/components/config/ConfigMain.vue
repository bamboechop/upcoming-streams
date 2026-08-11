<template>
  <main class="font-sans">
    <p class="font-sans text-[14px] italic mb-[16px]">{{ t('config.customizeSchedule') }}</p>
    <div class="rounded-lg border flex flex-col gap-y-[16px] p-[24px]">
      <div class="shadow-sm flex flex-col gap-x-[24px]">
        <div class="flex flex-col gap-y-[16px]">
          <ConfigPanelSelection
            :selected-option="selectedView"
            @update:selected-option="selectedView = $event" />
          <template v-if="selectedView === 'general'">
            <ConfigGeneral
              :amount-of-schedule-items="amountOfScheduleItems"
              :panel-title="panelTitle"
              :show-category="showCategory"
              :show-category-background-image="showCategoryBackgroundImage"
              :show-category-image="showCategoryImage"
              :show-countdown="showCountdown"
              :show-header="showHeader"
              :show-sticky-footer="showStickyFooter"
              :show-time-zone-inline="showTimeZoneInline"
              :show-times="showTimes"
              :show-title="showTitle"
              :show-usernames="showUsernames"
              @update:amount-of-schedule-items="emits('update:amount-of-schedule-items', $event)"
              @update:panel-title="emits('update:panel-title', $event)"
              @update:show-category="emits('update:show-category', $event)"
              @update:show-category-background-image="emits('update:show-category-background-image', $event)"
              @update:show-category-image="emits('update:show-category-image', $event)"
              @update:show-countdown="emits('update:show-countdown', $event)"
              @update:show-header="emits('update:show-header', $event)"
              @update:show-sticky-footer="emits('update:show-sticky-footer', $event)"
              @update:show-time-zone-inline="emits('update:show-time-zone-inline', $event)"
              @update:show-times="emits('update:show-times', $event)"
              @update:show-title="emits('update:show-title', $event)"
              @update:show-usernames="emits('update:show-usernames', $event)" />
          </template>
          <template v-if="selectedView === 'appearance'">
            <ConfigAppearance
              :background-color="backgroundColor"
              :countdown-background-color="countdownBackgroundColor"
              :countdown-font-color="countdownFontColor"
              :day-border-color="dayBorderColor"
              :font-color="fontColor"
              :header-background-color="headerBackgroundColor"
              :header-font-color="headerFontColor"
              :schedule-button-background-color="scheduleButtonBackgroundColor"
              :schedule-button-font-color="scheduleButtonFontColor"
              :theme="theme"
              :time-font-color="timeFontColor"
              :vacation-background-color="vacationBackgroundColor"
              :vacation-font-color="vacationFontColor"
              @update:background-color="emits('update:background-color', $event)"
              @update:countdown-background-color="emits('update:countdown-background-color', $event)"
              @update:countdown-font-color="emits('update:countdown-font-color', $event)"
              @update:day-border-color="emits('update:day-border-color', $event)"
              @update:font-color="emits('update:font-color', $event)"
              @update:header-background-color="emits('update:header-background-color', $event)"
              @update:header-font-color="emits('update:header-font-color', $event)"
              @update:schedule-button-background-color="emits('update:schedule-button-background-color', $event)"
              @update:schedule-button-font-color="emits('update:schedule-button-font-color', $event)"
              @update:theme="emits('update:theme', $event)"
              @update:time-font-color="emits('update:time-font-color', $event)"
              @update:vacation-background-color="emits('update:vacation-background-color', $event)"
              @update:vacation-font-color="emits('update:vacation-font-color', $event)" />
          </template>
          <template v-if="selectedView === 'typography'">
            <ConfigTypography
              :font-family="fontFamily"
              :font-size="fontSize"
              @update:font-family="emits('update:font-family', $event)"
              @update:font-size="emits('update:font-size', $event)" />
          </template>
        </div>
      </div>
      <hr />
      <div class="flex flex-row items-end justify-end gap-x-[16px]">
        <button
          class="text-[16px] rounded-md px-[16px] py-[8px] flex flex-row items-center gap-x-[8px] transition-colors duration-200 text-white"
          :class="{
            'cursor-pointer bg-teal-600 hover:bg-teal-700': !showSuccessMessage,
            'bg-emerald-500': showSuccessMessage,
          }"
          @click="!showSuccessMessage ? saveConfig() : undefined">
          <template v-if="showSuccessMessage">
            <Check :size="16" />
            {{ t('common.saved') }}
          </template>
          <template v-if="!showSuccessMessage">
            <Save :size="16" />
            {{ t('common.save') }}
          </template>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Save } from '@lucide/vue'
import ConfigPanelSelection from './ConfigPanelSelection.vue'
import ConfigGeneral from './ConfigGeneral.vue'
import ConfigAppearance from './ConfigAppearance.vue'
import ConfigTypography from './ConfigTypography.vue'
import type { TwitchExtensionTheme } from '@/common/interfaces/twitch.interface'

const { t } = useI18n({ useScope: 'global' })

defineProps<{
  amountOfScheduleItems: number
  backgroundColor: string
  countdownBackgroundColor: string
  countdownFontColor: string
  dayBorderColor: string
  fontColor: string
  fontFamily: string
  fontSize: number
  headerBackgroundColor: string
  headerFontColor: string
  panelTitle: string
  scheduleButtonBackgroundColor: string
  scheduleButtonFontColor: string
  showCategory: boolean
  showCategoryBackgroundImage: boolean
  showCategoryImage: boolean
  showCountdown: boolean
  showHeader: boolean
  showSuccessMessage: boolean
  showStickyFooter: boolean
  showTimeZoneInline: boolean
  showTimes: boolean
  showTitle: boolean
  showUsernames: boolean
  theme: string
  timeFontColor: string
  vacationBackgroundColor: string
  vacationFontColor: string
}>()

const emits = defineEmits<{
  (e: 'save-config'): void
  (e: 'update:amount-of-schedule-items', value: number): void
  (e: 'update:background-color', value: string): void
  (e: 'update:countdown-background-color', value: string): void
  (e: 'update:countdown-font-color', value: string): void
  (e: 'update:day-border-color', value: string): void
  (e: 'update:font-color', value: string): void
  (e: 'update:font-family', value: string): void
  (e: 'update:font-size', value: number): void
  (e: 'update:header-background-color', value: string): void
  (e: 'update:header-font-color', value: string): void
  (e: 'update:panel-title', value: string): void
  (e: 'update:schedule-button-background-color', value: string): void
  (e: 'update:schedule-button-font-color', value: string): void
  (e: 'update:selected-view', value: 'general' | 'appearance' | 'typography'): void
  (e: 'update:show-category', value: boolean): void
  (e: 'update:show-category-background-image', value: boolean): void
  (e: 'update:show-category-image', value: boolean): void
  (e: 'update:show-countdown', value: boolean): void
  (e: 'update:show-header', value: boolean): void
  (e: 'update:show-sticky-footer', value: boolean): void
  (e: 'update:show-time-zone-inline', value: boolean): void
  (e: 'update:show-times', value: boolean): void
  (e: 'update:show-title', value: boolean): void
  (e: 'update:show-usernames', value: boolean): void
  (e: 'update:theme', value: TwitchExtensionTheme): void
  (e: 'update:time-font-color', value: string): void
  (e: 'update:vacation-background-color', value: string): void
  (e: 'update:vacation-font-color', value: string): void
}>()

const selectedView = ref<'general' | 'appearance' | 'typography'>('general')

// Watch for changes in selectedView and emit them
watch(selectedView, (newValue) => {
  emits('update:selected-view', newValue);
});

const saveConfig = () => {
  emits('save-config')
}
</script>
