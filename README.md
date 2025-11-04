# 🏏 Sankalp Premier League (SPL)

A modern, futuristic cricket league management system built with React and Supabase.

![SPL Banner](https://img.shields.io/badge/SPL-Sankalp%20Premier%20League-blue?style=for-the-badge&logo=cricket&logoColor=white)

## ✨ Features

### 🎨 **Modern Futuristic UI**
- Neon glow effects and glass-morphism design
- Responsive mobile-first layout
- Dark theme with cyan/purple accent colors
- Smooth animations and transitions

### 📝 **Player Registration**
- Real-time form validation
- Direct Supabase database integration
- Automatic data sync with fallback storage
- Success/error notifications

### 🏆 **Tournament Management**
- Live auction system
- Team squads management
- Match scheduling
- Real-time scoring system
- Tournament standings

### 📊 **Database Features**
- Complete PostgreSQL schema
- Row Level Security (RLS) policies
- Automatic timestamps and UUIDs
- Player statistics tracking
- Auction history and bid tracking

### 📞 **Support System**
- Fixed contact bar at bottom of home page
- Direct contact links for support team
- Mobile-optimized contact display

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeetshorey123/SPL.git
   cd SPL
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create `.env` in root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   REACT_APP_SYNC_SERVER_URL=http://localhost:4000
   ```
   
   Create `server/.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE=your_service_role_key
   PORT=4000
   ALLOW_ALL_ORIGINS=true
   ```

4. **Database Setup**
   - Copy contents of `supabase_complete_schema.sql`
   - Paste in Supabase SQL Editor
   - Run the script to create all tables and policies

5. **Start the application**
   ```bash
   # Terminal 1: Start sync server
   cd server
   npm start
   
   # Terminal 2: Start React app
   npm start
   ```

6. **Access the application**
   - React App: http://localhost:3000 (or next available port)
   - Sync Server: http://localhost:4000

## 🏗️ Project Structure

```
SPL/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Home.js       # Main dashboard
│   │   ├── PlayerRegistration.js
│   │   ├── LiveAuction.js
│   │   ├── Squads.js
│   │   └── ...
│   ├── config/           # Configuration files
│   │   └── supabase.js   # Supabase client setup
│   └── styles/           # CSS files
├── server/               # Express sync server
│   ├── index.js         # Server entry point
│   └── .env             # Server environment
├── supabase_complete_schema.sql  # Database schema
├── SETUP_GUIDE.md       # Detailed setup instructions
└── README.md           # This file
```

## 📱 Pages & Features

### 🏠 **Home Dashboard**
- Tournament overview cards
- Quick registration access
- Live statistics display
- Contact support bar (fixed at bottom)

### 📝 **Player Registration**
- Vertical stacked form layout
- Real-time validation
- Supabase integration with localStorage fallback
- Mobile-optimized design

### 🏆 **Live Auction**
- Real-time bidding interface
- Team budget tracking
- Player status management
- Bid history tracking

### 👥 **Team Squads**
- Player roster management
- Captain/Vice-captain selection
- Jersey number assignment
- Team statistics

### 📅 **Match Schedule**
- Tournament fixture management
- Match status tracking
- Venue information
- Date/time scheduling

### 📊 **Scoring System**
- Live match scoring
- Over-by-over tracking
- Player statistics
- Match results

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **CSS3** - Styling with custom properties
- **Modern JavaScript (ES6+)**

### Backend
- **Express.js** - Sync server
- **Supabase** - Database and authentication
- **PostgreSQL** - Database engine
- **Row Level Security** - Data protection

### Development Tools
- **Create React App** - Build tooling
- **ESLint** - Code linting
- **Git** - Version control

## 🗄️ Database Schema

The project includes a comprehensive database schema with 11+ tables:

- `player_registrations_supabase` - Registration form data
- `tournaments` - Tournament information
- `teams` - Team details and budgets
- `live_auctions` - Auction management
- `match_schedule` - Fixture management
- `player_statistics` - Performance tracking
- And more...

## 📞 Support & Contact

For any help or support:

- **JEET**: [9833232395](tel:9833232395)
- **RISHABH**: [9967061814](tel:9967061814)

## 🔧 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Database Testing
```bash
node simple-test.js
```

## 🌟 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary to Sankalp Premier League.

## 🏏 About SPL

Sankalp Premier League is a modern cricket tournament management system designed to provide a seamless experience for players, team owners, and organizers. Built with cutting-edge technology and a futuristic design, SPL brings cricket management into the digital age.

---

Made with ❤️ for Sankalp Premier League

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
