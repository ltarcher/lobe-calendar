---
hero:
  title: Chinese <b>Calendar</b> Plugin
  description: A lunar calendar plugin with timezone support
---

## Features

- Display Gregorian and lunar dates
- Show solar terms and festivals
- Support timezone configuration (default: Asia/Shanghai)

## Parameters

- `date`: Optional date string in YYYY-MM-DD format (default: current date)
- `time`: Optional time string in HH:mm format
- `timezone`: Optional timezone identifier (e.g. 'Asia/Shanghai', 'America/New_York')
- `config`: Display configuration options

## Example

```json
{
  "date": "2023-10-01",
  "timezone": "America/New_York"
}
```

<code src="./demo.tsx" inline></code>