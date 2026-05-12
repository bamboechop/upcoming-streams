import type {
  TwitchExtensionAuthResponse,
  TwitchExtensionConfiguration,
  TwitchStreamsResponse,
  TwitchStreamScheduleResponse,
  TwitchStreamScheduleSegment,
  TwitchUserResponse,
  GroupedScheduleItem,
  TwitchExtensionTheme,
  TwitchExtensionThemeConfiguration,
  TwitchUrlSearchParams,
} from '@/common/interfaces/twitch.interface';
import { ref, watch } from 'vue';
import { themes } from '@/common/themes';
import { useUrlSearchParams } from '@vueuse/core';

const MAX_SCHEDULE_FETCHES = 3;
const MAX_SCHEDULE_ITEMS = 7;

// Store shared state outside the composable to persist between re-renders
const allScheduleItems = ref<TwitchStreamScheduleSegment[]>([]);
const broadcasterName = ref<string>('');
const config = ref<TwitchExtensionConfiguration>({
  ...themes.default,
  amountOfScheduleItems: 3,
  fontFamily: 'Roboto',
  fontSize: 16,
  lastSeenVersion: undefined,
  panelTitle: '',
  showCategory: true,
  showCategoryBackgroundImage: false,
  showCategoryImage: false,
  showCountdown: false,
  showHeader: true,
  showTimes: true,
  showTitle: true,
  showUsernames: true,
  theme: 'default',
});
const darkMode = ref<boolean>(false);
const isLive = ref<boolean>(false);
const storedAuth = ref<Pick<TwitchExtensionAuthResponse, 'channelId' | 'clientId' | 'helixToken'> | null>(null);
const vacation = ref<TwitchStreamScheduleResponse['data']['vacation']>(null);

const urlParams = useUrlSearchParams<TwitchUrlSearchParams>('history');

export const useTwitch = () => {
  const schedule = ref<GroupedScheduleItem[]>([]);
  const twitchLoading = ref<boolean>(true);

  const groupScheduleItems = (limit: number): GroupedScheduleItem[] => {
    // First, take only the number of items we want to show
    const limitedItems = [...allScheduleItems.value].slice(0, limit);

    // Process each item to extract usernames
    const processedItems = limitedItems.map(item => {
      const title = item.title;
      const usernameRegex = /@([a-zA-Z0-9][a-zA-Z0-9_]{3,24})(?:\s|$)/g;
      const usernames: string[] = [];

      // Extract usernames
      let match;
      while ((match = usernameRegex.exec(title)) !== null) {
        usernames.push(match[1]);
      }

      // Return the item with usernames
      return {
        ...item,
        usernames
      };
    });

    // Then group them by date
    const groupedSchedule = processedItems.reduce((acc: { [key: string]: TwitchStreamScheduleSegment[] }, item) => {
      const date = new Date(item.start_time).toLocaleDateString(urlParams.locale, { day: 'numeric', month: 'numeric', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Convert to array format
    return Object.entries(groupedSchedule).map(([date, items]) => ({
      date,
      items
    }));
  };

  const fetchBroadcasterInfo = async ({ channelId, clientId, helixToken }: Pick<TwitchExtensionAuthResponse, 'channelId' | 'clientId' | 'helixToken'>) => {
    try {
      const response = await window.fetch(`https://api.twitch.tv/helix/users?id=${channelId}`, {
        headers: {
          'Authorization': `Extension ${helixToken}`,
          'Client-ID': clientId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch broadcaster info. Please try again later.');
      }

      const data: TwitchUserResponse = await response.json();
      broadcasterName.value = data.data[0].login;

    } catch (error) {
      console.error('Error fetching broadcaster info:', error);
    }
  }

  const fetchCategoryImages = async (
    scheduleItems: TwitchStreamScheduleSegment[],
    { clientId, helixToken }: Pick<TwitchExtensionAuthResponse, 'clientId' | 'helixToken'>
  ) => {
    const categoryIds = [...new Set(
      scheduleItems
        .map(item => item.category?.id)
        .filter((id): id is string => Boolean(id))
    )];

    if (categoryIds.length === 0) {
      return;
    }

    const gameIdsQuery = categoryIds.map(id => `id=${encodeURIComponent(id)}`).join('&');
    const response = await window.fetch(`https://api.twitch.tv/helix/games?${gameIdsQuery}`, {
      headers: {
        'Authorization': `Extension ${helixToken}`,
        'Client-ID': clientId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category images.');
    }

    const gamesData: { data: { id: string; box_art_url: string }[] } = await response.json();
    const gameImageMap = new Map(
      gamesData.data.map(game => [game.id, game.box_art_url.replace('{width}', '357').replace('{height}', '500')])
    );

    scheduleItems.forEach(item => {
      if (!item.category) return;
      const imageUrl = gameImageMap.get(item.category.id);
      item.category.image_url = imageUrl;
    });
  };

  const fetchSchedule = async ({ channelId, clientId, helixToken }: Pick<TwitchExtensionAuthResponse, 'channelId' | 'clientId' | 'helixToken'>) => {
    try {
      const now = new Date();
      const startTimeUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const startTimeRFC3339 = startTimeUTC.toISOString().replace('.000Z', 'Z');
      const desired = urlParams.mode === 'config' ? MAX_SCHEDULE_ITEMS : config.value.amountOfScheduleItems;

      allScheduleItems.value = [];
      let cursor: string | null = null;

      for (let page = 0; page < MAX_SCHEDULE_FETCHES; page++) {
        let url = `https://api.twitch.tv/helix/schedule?broadcaster_id=${channelId}&start_time=${startTimeRFC3339}&first=${MAX_SCHEDULE_ITEMS}`;
        if (cursor) {
          url += `&after=${cursor}`;
        }

        const response = await window.fetch(url, {
          headers: {
            'Authorization': `Extension ${helixToken}`,
            'Client-ID': clientId,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            if (page === 0) {
              allScheduleItems.value = [];
              schedule.value = [];
              vacation.value = null;
              return;
            }
            break;
          }
          switch (response.status) {
            case 401:
              throw new Error('Authentication failed. Please refresh the page.');
            case 403:
              throw new Error('Not authorized to access this schedule.');
            case 429:
              throw new Error('Rate limit exceeded. Please try again later.');
            default:
              throw new Error('Failed to fetch schedule. Please try again later.');
          }
        }

        const data: TwitchStreamScheduleResponse = await response.json();

        if (page === 0) {
          vacation.value = data.data.vacation;
        }

        const relevant = data.data.segments.filter(item => {
          if (item.canceled_until) return false;
          if (item.end_time && new Date(item.end_time) < now) return false;
          if (vacation.value && item.start_time && new Date(item.start_time) < new Date(vacation.value.end_time) && new Date(item.start_time) > new Date(vacation.value.start_time)) return false;
          return true;
        });
        allScheduleItems.value.push(...relevant);

        if (allScheduleItems.value.length >= desired || !data.pagination?.cursor) {
          break;
        }

        cursor = data.pagination.cursor;
      }

      if (urlParams.mode === 'config' || config.value.showCategoryImage || config.value.showCategoryBackgroundImage) {
        await fetchCategoryImages(allScheduleItems.value, { clientId, helixToken });
      }

      schedule.value = groupScheduleItems(config.value.amountOfScheduleItems);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      allScheduleItems.value = [];
      schedule.value = [];
      vacation.value = null;
    }
  }

  const LIVE_POLL_INTERVAL_MS = 30_000;
  let livePollingTimer: ReturnType<typeof setInterval> | null = null;

  const checkIfLive = async () => {
    if (!storedAuth.value) return;
    try {
      const response = await window.fetch(
        `https://api.twitch.tv/helix/streams?user_id=${storedAuth.value.channelId}`,
        {
          headers: {
            'Authorization': `Extension ${storedAuth.value.helixToken}`,
            'Client-ID': storedAuth.value.clientId,
          },
        },
      );
      if (!response.ok) return;
      const data: TwitchStreamsResponse = await response.json();
      isLive.value = data.data.length > 0 && data.data[0].type === 'live';
    } catch {
      // Silently ignore -- we'll retry on the next poll
    }
  };

  const startLivePolling = () => {
    if (livePollingTimer) return;
    checkIfLive();
    livePollingTimer = setInterval(checkIfLive, LIVE_POLL_INTERVAL_MS);
  };

  const stopLivePolling = () => {
    if (livePollingTimer) {
      clearInterval(livePollingTimer);
      livePollingTimer = null;
    }
  };

  // Watch for changes in amountOfScheduleItems and update the displayed schedule
  watch(() => config.value.amountOfScheduleItems, (newValue) => {
    schedule.value = groupScheduleItems(newValue);
  });

  const saveConfig = async () => {
    try {
      if (config.value.amountOfScheduleItems > 7) {
        config.value.amountOfScheduleItems = 7;
      }
      if (config.value.amountOfScheduleItems < 1) {
        config.value.amountOfScheduleItems = 1;
      }
      window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify(config.value));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  const expandShortHex = (color: string) => {
    // If it's already a 6-digit hex, return as is
    if (color.length === 7) return color

    // For 3-digit hex, expand each digit
    const hex = color.slice(1) // Remove #
    return `#${hex.split('').map(char => char + char).join('')}`
  }

  const expandThemeColors = (themeConfig: TwitchExtensionThemeConfiguration): TwitchExtensionThemeConfiguration => {
    return {
      backgroundColor: expandShortHex(themeConfig.backgroundColor),
      countdownBackgroundColor: expandShortHex(themeConfig.countdownBackgroundColor),
      countdownFontColor: expandShortHex(themeConfig.countdownFontColor),
      dayBorderColor: expandShortHex(themeConfig.dayBorderColor),
      fontColor: expandShortHex(themeConfig.fontColor),
      headerBackgroundColor: expandShortHex(themeConfig.headerBackgroundColor),
      headerFontColor: expandShortHex(themeConfig.headerFontColor),
      scheduleButtonBackgroundColor: expandShortHex(themeConfig.scheduleButtonBackgroundColor),
      scheduleButtonFontColor: expandShortHex(themeConfig.scheduleButtonFontColor),
      timeFontColor: expandShortHex(themeConfig.timeFontColor),
      vacationBackgroundColor: expandShortHex(themeConfig.vacationBackgroundColor),
      vacationFontColor: expandShortHex(themeConfig.vacationFontColor),
    }
  }

  const updateTheme = (themeName: TwitchExtensionTheme) => {
    // Skip if trying to switch to 'custom' as custom isn't a predefined theme
    if (themeName === 'custom') {
      // Just update the theme name without changing any colors
      config.value.theme = 'custom';
      return;
    }

    if (themes[themeName]) {
      // Apply all theme properties but keep non-theme specific settings
      const currentConfig = { ...config.value };
      const expandedTheme = expandThemeColors(themes[themeName]);

      config.value = {
        ...currentConfig,
        ...expandedTheme,
        theme: themeName,
        // Preserve user settings that aren't part of the theme
        amountOfScheduleItems: currentConfig.amountOfScheduleItems,
        fontFamily: currentConfig.fontFamily,
        fontSize: currentConfig.fontSize,
        lastSeenVersion: currentConfig.lastSeenVersion,
        panelTitle: currentConfig.panelTitle,
        showCategory: currentConfig.showCategory,
        showCategoryBackgroundImage: currentConfig.showCategoryBackgroundImage,
        showCategoryImage: currentConfig.showCategoryImage,
        showCountdown: currentConfig.showCountdown,
        showTimes: currentConfig.showTimes,
        showTitle: currentConfig.showTitle,
        showUsernames: currentConfig.showUsernames,
      };
    }
  }

  window.Twitch.ext.configuration.onChanged(() => {
    const twitchConfig = window.Twitch.ext.configuration.broadcaster;
    if (twitchConfig?.content) {
      try {
        const parsedConfig = JSON.parse(twitchConfig.content) as TwitchExtensionConfiguration;

        // Start with the current config which includes defaults
        const newConfig = { ...config.value };

        // If using a predefined theme, apply its colors
        if (parsedConfig.theme !== 'custom') {
          Object.assign(newConfig, expandThemeColors(themes[parsedConfig.theme]));
        }

        // Only then overlay the saved configuration, preserving any new default values
        // that weren't in the saved config
        config.value = {
          ...newConfig,
          ...parsedConfig,
          // For color values, only take them from parsedConfig if we're using a custom theme
          ...(parsedConfig.theme === 'custom' ? {
            backgroundColor: parsedConfig.backgroundColor,
            countdownBackgroundColor: parsedConfig.countdownBackgroundColor,
            countdownFontColor: parsedConfig.countdownFontColor,
            dayBorderColor: parsedConfig.dayBorderColor,
            fontColor: parsedConfig.fontColor,
            headerBackgroundColor: parsedConfig.headerBackgroundColor,
            headerFontColor: parsedConfig.headerFontColor,
            scheduleButtonBackgroundColor: parsedConfig.scheduleButtonBackgroundColor,
            scheduleButtonFontColor: parsedConfig.scheduleButtonFontColor,
            timeFontColor: parsedConfig.timeFontColor,
            vacationBackgroundColor: parsedConfig.vacationBackgroundColor,
            vacationFontColor: parsedConfig.vacationFontColor,
          } : {}),
        };
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
  });

  window.Twitch.ext.onContext(({ theme }) => {
    darkMode.value = theme === 'dark';
  });

  window.Twitch.ext.onAuthorized(async (auth) => {
    storedAuth.value = {
      channelId: auth.channelId,
      clientId: auth.clientId,
      helixToken: auth.helixToken,
    };

    await fetchBroadcasterInfo(storedAuth.value);
    await fetchSchedule(storedAuth.value);
    await checkIfLive();

    twitchLoading.value = false;
  });

  return {
    broadcasterName,
    config,
    isLive,
    schedule,
    twitchLoading,
    vacation,
    saveConfig,
    startLivePolling,
    stopLivePolling,
    updateTheme,
  };
};
