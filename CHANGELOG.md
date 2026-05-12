# Changelog

## [1.5.1] - 2026-05-13

### Fixed
- Scheduled streams on a vacation day are no longer shown.

## [1.5.0] - 2026-02-28

### Added
- You can now show the stream category image next to your stream information.
- You can now show the stream category image as background image behind your stream information.

## [1.4.0] - 2026-02-21

### Added
- You can show up to 7 upcoming streams now.
- You can display a counter to the next stream start now.

### Fixed
- When a recurring stream is canceled the extension now tries to find more non-canceled streams to still display the configured amount of streams to be shown.
- Streams with an end time are no longer displayed when the end time is in the past.

## [1.3.1] - 2025-08-19

### Fixed
- Schedule grouping now uses locale-aware date formatting and preserves timezone information in date headers

## [1.3.0] - 2025-07-25

### Added
- This update overlay 😎
- Component panel - show off your upcoming streams directly in the video player now
- Overlay panel - show off your upcoming streams directly as an overlay over the video player now

## [1.2.2] - 2025-06-24

### Fixed
- Cancelled recurring streams no longer show up in the list of planned streams
- Improved username detection when mentioning streamers you stream with in the title of the stream

## [1.2.1] - 2025-05-03

### Fixed
- Schedule now uses midnight UTC for start time instead of local midnight, preventing past events from appearing as upcoming

## [1.2.0] - 2025-04-21

### Added
- Mobile panel - show off your upcoming streams on mobile now

### Fixed
- Panel content higher than maximum height of Twitch panel no longer causes "View full schedule" panel to scroll away from bottom edge of extension frame

## [1.1.0] - 2025-04-13

### Added
- Added vacation mode support
- Added showHeader configuration option
- Added five new themes

### Changed
- Enhanced theme selection with grouped options
- Refactored layout and organization of color configuration options
- Improved translation strings to clearly communicate when vacation info is shown

### Fixed
- Minor styling issues

## [1.0.0] - 2025-04-11

- Initial release
