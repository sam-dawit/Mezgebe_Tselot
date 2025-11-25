# Mezgebe Tselot (መዝገበ ጸሎት)

An Ethiopian Orthodox Tewahedo Church mobile application built with React Native and Expo. The app provides access to the Bible, church locations, calendar, and more.

## Features

- 📖 **Bible Reader**: Read the Bible in English and Amharic with commentary
- 🔍 **Search**: Search verses across the entire Bible
- 🔖 **Bookmarks**: Save and organize your favorite verses
- 📅 **Calendar**: Ethiopian Orthodox calendar with feast days
- 🗺️ **Church Locator**: Find Ethiopian Orthodox churches across the United States
- ⚙️ **Settings**: Customize language, theme, and font size

## Tech Stack

### Frontend
- **React Native** with Expo
- **Expo Router** for navigation
- **TypeScript**
- **React Native Maps** for church locations
- **@gorhom/bottom-sheet** for modal interactions

### Backend
- **FastAPI** (Python)
- **MongoDB** for data storage
- **Motor** for async MongoDB operations

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.13
- MongoDB
- Expo Go app (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Mezgebe_Tselot.git
   cd Mezgebe_Tselot
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `backend/.env`:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=mezgebe_tselot
   SECRET_KEY=your-secret-key-here
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Initialize the database**
   ```bash
   curl -X POST http://localhost:8000/api/init-data
   ```

8. **Start the Expo development server**
   ```bash
   npm start
   ```

9. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
Mezgebe_Tselot/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── reading.tsx        # Bible reading screen
├── components/            # Reusable components
├── contexts/              # React contexts (Theme, Settings)
├── utils/                 # Utility functions and API client
├── backend/               # FastAPI backend
│   ├── server.py         # Main server file
│   ├── churches.json     # Church data
│   └── requirements.txt  # Python dependencies
└── assets/               # Images and fonts
```

## API Endpoints

- `GET /api/books` - Get all Bible books
- `GET /api/books/{book}/chapters/{chapter}` - Get verses for a chapter
- `GET /api/search` - Search verses
- `GET /api/churches` - Get all churches
- `GET /api/churches/nearby` - Get nearby churches
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npx expo build:android
npx expo build:ios
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Ethiopian Orthodox Tewahedo Church
- Expo and React Native communities
- All contributors and testers
