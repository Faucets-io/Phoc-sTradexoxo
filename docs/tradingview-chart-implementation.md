
# TradingView Chart Implementation

## Overview

The trading page uses the official TradingView widget library to display real-time cryptocurrency charts. This provides a professional, feature-rich charting experience without building a custom solution.

## Implementation Details

### Script Loading

The TradingView widget script is loaded dynamically from their CDN:

```javascript
const script = document.createElement('script');
script.src = 'https://s3.tradingview.com/tv.js';
script.async = true;
```

### Initialization Logic

The chart initialization includes several key steps:

1. **Script Check**: First checks if TradingView is already loaded (handles hot reloads)
2. **DOM Ready Delay**: 100ms timeout ensures containers are fully rendered
3. **Container Clearing**: Previous widget instances are cleared before creating new ones
4. **Dual Instances**: Separate widgets for desktop and mobile views

### Widget Configuration

Key configuration options used:

- **Symbol**: Trading pair (e.g., "BTCUSDT") derived from selected pair
- **Interval**: 15-minute candles for active trading view
- **Theme**: Dark mode matching the app's design
- **Style**: Candlestick chart (style: '1')
- **Timezone**: UTC for consistency
- **Studies**: Volume indicator included by default

### Custom Styling

Chart colors are customized to match the app's success/danger color scheme:

```javascript
overrides: {
  'mainSeriesProperties.candleStyle.upColor': '#22c55e',      // Green
  'mainSeriesProperties.candleStyle.downColor': '#ef4444',    // Red
  'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
  'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
  'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
  'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
}
```

### Responsive Design

- **Desktop**: Full-height chart (calc(100vh-140px)) with toolbar visible
- **Mobile**: Fixed 400px height with simplified toolbar

### Cleanup

The useEffect hook returns a cleanup function that clears widget containers when the component unmounts or the selected pair changes:

```javascript
return () => {
  const desktopContainer = document.getElementById('tradingview_chart');
  const mobileContainer = document.getElementById('tradingview_chart_mobile');
  if (desktopContainer) desktopContainer.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';
};
```

## Benefits

- **Professional Features**: Advanced charting tools, indicators, and drawing tools
- **Real-time Data**: Direct integration with TradingView's market data
- **No Maintenance**: Chart functionality maintained by TradingView
- **Familiar Interface**: Traders recognize the professional TradingView interface

## Technical Considerations

- Chart updates automatically when `selectedPair` state changes
- No package installation required (CDN-based)
- TypeScript window typing: `(window as any).TradingView`
- Containers must have unique IDs for desktop vs mobile instances
