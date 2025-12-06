# Responsive Improvements for ApiTinker

## Summary
Enhanced the application's responsiveness to support small screen widths down to 400px (and works well down to 320px minimum).

## Changes Made

### 1. Tailwind Configuration (`tailwind.config.js`)
- Added custom `xs` breakpoint at 400px for fine-grained responsive control

### 2. Global Styles (`src/style.css`)
- Added `overflow-x: hidden` to prevent horizontal scrolling
- Set minimum app width to 320px
- Added responsive utilities for small screens:
  - `.responsive-hide-sm` - Hide elements on small screens
  - `.responsive-text-sm` - Reduce font size on small screens
  - `.responsive-padding-sm` - Reduce padding on small screens
- Added touch scrolling support for mobile devices
- Added line-clamp utilities for text truncation
- Set minimum button heights (32px default, 28px on <400px)
- Set input font-size to 16px on mobile to prevent iOS zoom

### 3. Popup App (`src/pages/popup/App.vue`)
- Made navigation responsive:
  - Reduced padding on small screens (px-2 xs:px-4)
  - Scaled logo/title size (text-base xs:text-xl)
  - Made nav tabs wrap with flex-wrap and smaller sizes
  - Added whitespace-nowrap to prevent text wrapping in tabs

### 4. Options Page (`src/pages/options/App.vue`)
- Responsive padding throughout (p-2 xs:p-4 sm:p-8)
- Scaled headings for different screen sizes
- Made all form fields stack vertically on small screens
- Made inputs full width on mobile, auto width on larger screens

### 5. ApiClient Component (`src/components/ApiClient.vue`)
- Request builder:
  - Method selector, URL input, and Send button stack vertically on small screens
  - Headers section uses column layout on mobile with full-width buttons
  - Body textarea has responsive padding and font sizes
- Response section:
  - Header information stacks vertically on small screens
  - Status badges wrap naturally
  - Code blocks use break-all for long URLs
- History & Favorites:
  - Tabs use smaller sizes with proper wrapping
  - History items use truncation with min-w-0 and shrink-0 for proper flex behavior
  - Made all interactive elements easier to tap on mobile

### 6. MockManager Component (`src/components/MockManager.vue`)
- Header actions wrap and take full width on mobile
- Rule cards stack vertically on small screens
- Edit/Delete buttons become full-width on mobile
- Modal dialogs have responsive padding
- Long URLs break properly with break-all

### 7. BugReporter Component (`src/components/BugReporter.vue`)
- Report cards stack action buttons on mobile
- Export buttons (JSON/MD) flex across available width
- Report viewer closes button is full width on mobile
- Description text uses line-clamp for multi-line truncation

### 8. Settings Component (`src/components/Settings.vue`)
- All form fields stack vertically on mobile
- Number inputs become full width on small screens
- Buttons maintain proper sizing across breakpoints
- Spacing scales down appropriately

## Responsive Breakpoints Used

- **xs**: 400px (custom breakpoint for very small screens)
- **sm**: 640px (Tailwind default, used in options page)
- **md**: 768px (Tailwind default, rarely used - simplified to single column)

## Key Techniques Applied

1. **Flexible Layouts**: Changed fixed layouts to flex-col on mobile, flex-row on larger screens
2. **Responsive Sizing**: Used xs:size for scaled sizes (text, padding, gaps)
3. **Text Truncation**: Added truncate, break-all, and line-clamp where appropriate
4. **Flex Utilities**: Used min-w-0, shrink-0, flex-1 to control flex behavior
5. **Wrapping**: Added flex-wrap and whitespace-nowrap strategically
6. **Touch Targets**: Ensured buttons have minimum heights for easy tapping
7. **Form Optimization**: Set font-size on inputs to prevent iOS auto-zoom

## Testing Recommendations

1. Test at 400px width (the target minimum)
2. Test at 375px width (common phone size)
3. Test at 320px width (absolute minimum)
4. Test all interactive elements for touch usability
5. Test form inputs don't trigger zoom on iOS devices
6. Test scrolling behavior in all sections with overflow

## Browser Compatibility

- Modern browsers with CSS Grid and Flexbox support
- Touch devices (iOS Safari, Chrome Mobile, etc.)
- Tailwind CSS 3.x utilities
- Vue 3.x components
