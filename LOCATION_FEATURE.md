# Location Feature for SOS Alerts

## Overview
The SOS system now includes location functionality that automatically includes the user's current location in emergency alerts sent to emergency contacts.

## Features Added

### Backend Changes
1. **Google Geocoding API Integration**: Converts GPS coordinates to readable addresses
2. **Enhanced SOS Routes**: Both `/voice` and `/motion` routes now accept location data
3. **Location Message Formatting**: Includes both human-readable address and Google Maps link

### Frontend Changes
1. **API Service Updates**: `triggerVoiceSos()` and `triggerMotionSos()` now accept optional location parameters
2. **Enhanced SOS Page**: Automatically includes current location when triggering SOS
3. **Dashboard Tests**: Test buttons now include location data
4. **Background Service**: Background SOS triggers now include location

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and add your Google Maps API key:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Geocoding API
   - Maps JavaScript API (if using maps display)
4. Create an API key and restrict it to your domain/IP
5. Add the API key to your `.env` file

### 3. Permissions
The app already requests location permissions. Ensure users grant location access for the feature to work properly.

## How It Works

### SOS Alert Flow
1. User triggers SOS (voice, motion, or manual)
2. App gets current GPS coordinates using Geolocator
3. Coordinates are sent to backend along with SOS request
4. Backend uses Google Geocoding API to convert coordinates to address
5. SMS message includes both readable address and Google Maps link
6. Emergency contacts receive location information

### Message Format
```
🚨 SOS ALERT! 🚨
[User Name] triggered an alert via RakshaNet!

Location: [Readable Address]
Map Link: https://www.google.com/maps?q=[latitude],[longitude]
```

### Fallback Behavior
- If Google API key is not configured: Shows raw coordinates
- If geocoding fails: Shows raw coordinates with Maps link
- If location is not available: SOS still works without location

## API Changes

### POST /api/sos/voice
**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS alert sent to 3 emergency contacts",
  "contactsNotified": 3,
  "locationIncluded": true
}
```

### POST /api/sos/motion
Same format as voice endpoint.

## Testing
1. Use dashboard test buttons to verify location is included
2. Check SMS messages received by emergency contacts
3. Verify Google Maps links work correctly
4. Test with and without location permissions

## Troubleshooting

### Location Not Working
- Check location permissions in device settings
- Verify GPS is enabled
- Test in outdoor environment for better GPS signal

### Geocoding Not Working
- Verify Google Maps API key is correct
- Check API key has Geocoding API enabled
- Verify API key restrictions allow your server IP
- Check API quotas and billing

### SMS Not Including Location
- Check backend logs for geocoding errors
- Verify location data is being sent from client
- Test with raw coordinates fallback
