export interface TwitchStreamScheduleSegment {
  canceled_until: string | null;
  category: {
    id: string;
    image_url?: string;
    name: string;
  } | null;
  end_time: string; // in RFC3339 format
  id: string;
  is_recurring: boolean;
  start_time: string; // in RFC3339 format
  title: string;
  usernames: string[];
}

export interface GroupedScheduleItem {
  date: string; // in YYYY-MM-DD format
  items: TwitchStreamScheduleSegment[];
}

export interface TwitchStreamScheduleResponse {
  data: {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    segments: TwitchStreamScheduleSegment[];
    vacation: {
      end_time: string; // in RFC3339 format
      start_time: string; // in RFC3339 format
    } | null;
  };
  pagination: {
    cursor?: string;
  };
}

export interface TwitchStreamsResponse {
  data: {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: 'live' | '';
    title: string;
    started_at: string;
  }[];
}

export interface TwitchUserResponse {
  data: {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
  }[];
}

export interface TwitchExtensionAuthResponse {
  channelId: string;
  clientId: string;
  helixToken: string;
  token: string;
  userId: string;
}

export interface TwitchExtensionContextResponse {
  theme: 'light' | 'dark';
}

export type CountdownState = 'countdown' | 'grace' | 'live';

export type TwitchExtensionTheme = 'default' | 'neonNights' | 'mintChocolate' | 'sunsetVibes' | 'royalPurple' | 'enchantedForest' | 'retroWave' | 'crystalClear' | 'sakuraSpring' | 'oceanBreeze' | 'deepSpace' | 'goldenHour' | 'lavenderFields' | 'custom';

export interface TwitchExtensionThemeConfiguration {
  backgroundColor: string;
  countdownBackgroundColor: string;
  countdownFontColor: string;
  dayBorderColor: string;
  fontColor: string;
  headerBackgroundColor: string;
  headerFontColor: string;
  scheduleButtonBackgroundColor: string;
  scheduleButtonFontColor: string;
  timeFontColor: string;
  vacationBackgroundColor: string;
  vacationFontColor: string;
}

export interface TwitchExtensionConfiguration extends TwitchExtensionThemeConfiguration {
  amountOfScheduleItems: number;
  fontFamily: string;
  fontSize: number;
  lastSeenVersion?: string;
  panelTitle: string;
  showCategory: boolean;
  showCategoryBackgroundImage: boolean;
  showCategoryImage: boolean;
  showCountdown: boolean;
  showHeader: boolean;
  showStickyFooter: boolean;
  showTimeZoneInline: boolean;
  showTimes: boolean;
  showTitle: boolean;
  showUsernames: boolean;
  theme: TwitchExtensionTheme;
}

interface TwitchUrlSearchParamsBase {
  language: string;
  locale: string;
  mode: 'config' | 'dashboard' | 'viewer';
  popout: boolean;
  state: 'approved' | 'hosted_test' | 'in_review' | 'pending_action' | 'ready_for_review' | 'released' | 'testing' | 'uploading';
}

interface WebPlatformParams extends TwitchUrlSearchParamsBase {
  platform: 'web';
  anchor: 'component' | 'panel' | 'video_overlay';
}

interface MobilePlatformParams extends TwitchUrlSearchParamsBase {
  platform: 'mobile';
}

export type TwitchUrlSearchParams = WebPlatformParams | MobilePlatformParams;
