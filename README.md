# WebRTC Video calling

This project is a peer-to-peer video communication application built with Angular and WebRTC. It enables real-time video sharing between two clients **without requiring a server for media transmission.** Here server is used for socket communication to establish a one time connection between 2 clients.

## Features

- **Peer-to-Peer Video Calls**: Direct video communication between two clients.
- **STUN Servers**: Used for NAT traversal during the connection setup.
- **End Call Functionality**: Allows users to terminate the call gracefully.
- **Real-Time Connection Handling**: Manage connection states and handle ICE candidates.

## Getting Started

### Prerequisites

- Node.js
- Angular CLI
- Socket.io (for signaling)

### Installation

1. Clone the repository and installation:

   ```bash
   git clone https://github.com/your-username/angular-webrtc-client.git
   cd angular-webrtc-client
   cd client && npm i
   cd ../server && npm i
   ```

2. Run client

   ```bash
   #in client directory
   ng serve
   ```

3. Run server

   ```bash
   #in server directory
   npm run dev # development server
   # or
   npm start # production server
   ```
