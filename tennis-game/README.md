# Multiplayer Tennis Game

A multiplayer Tennis Game where players use their phone as a controller via motion sensors.

## Features

- Real-time multiplayer via Socket.io
- Phone as controller with DeviceOrientation API (tilt control)
- 1-4 players per team
- Each player gets their own paddle
- AI opponent for solo play
- Best of 9 (first to 5 points) or 3-minute time limit
- Dedicated game screen + phone controllers
- Calibration and sensitivity settings
- HTTPS with self-signed certificate for iOS motion sensors

## Requirements

- Node.js (v14 or higher)
- Modern browser with motion sensor support
- OpenSSL (for generating SSL certificate)

## Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Generate a self-signed SSL certificate (one-time only):
```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365 -subj "/C=NL/ST=State/L=City/O=Dev/CN=localhost"
```

**IMPORTANT:** Never commit the certificate files (server.key and server.cert) to git. They are already in .gitignore.

## Usage

1. Start the server:
```bash
npm start
```

The server runs on port 3000 by default. You can use a different port with:
```bash
PORT=3001 npm start
```

2. Open the game screen on your computer/laptop/TV via HTTPS:
```
https://localhost:3000
```

3. Open the controller on your phone via HTTPS:
```
https://[your-ip-address]:3000/controller
```

**Note:** You must accept the browser warning about the self-signed certificate on each device. This is safe for local development.

## Solo Play Against AI

When you connect as the only player, an AI opponent is automatically added. The AI:
- Follows the ball and tries to defend
- Has a challenging but achievable difficulty level
- Is automatically disabled when a second player joins
- Returns when only 1 player remains

You can adjust AI difficulty in server.js:
```javascript
aiDifficulty: 0.7 // 0.0 = easy, 1.0 = nearly impossible
```

## How to Play

1. Each player opens the controller URL on their phone
2. Players are automatically assigned to teams (left/red vs right/blue)
3. Each player gets their own paddle stacked vertically
4. When at least 1 player per team is connected, the game can start
5. Tilt your phone left/right to move your paddle
6. Defend your section of the goal against the ball
7. First team to 5 points wins, or highest score after 3 minutes

## Controller Tips

- Hold your phone upright (portrait mode)
- Use the calibrate button to set your starting position
- Adjust sensitivity to your preference
- iOS 13+ asks for motion permission - click "Allow Motion"

## Technology

- Node.js + Express
- Socket.io for real-time communication
- HTTPS with self-signed certificate
- Canvas API for game rendering
- DeviceOrientation API for motion controls
- Vanilla JavaScript (no external frameworks)

## Local Network Setup

To connect from phones:

1. Find your computer's IP address:
   - macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig`
   - Linux: `ip addr show`

2. Use this IP address instead of localhost:
   ```
   https://192.168.1.100:3000/controller
   ```

3. Make sure your firewall allows the port

## Game Configuration

You can adjust game settings in `server.js`:

```javascript
const gameState = {
  gameDuration: 180000,  // 3 minutes in milliseconds
  winScore: 5,           // First to 5 points wins
  aiDifficulty: 0.7      // AI difficulty (0.0 - 1.0)
}
```

## SSL Certificate Renewal

The certificate is valid for 365 days by default. To renew:
```bash
rm server.key server.cert
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365 -subj "/C=NL/ST=State/L=City/O=Dev/CN=localhost"
```

## License

MIT
