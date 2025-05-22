# 🌌 Universe Explorer 3D

Explore the wonders of the cosmos with **Universe Explorer 3D**—an immersive web-based solar system simulation that combines education with interactive gameplay. Built using **React Three.js** and **Next.js**, this project offers a unique blend of space exploration, planetary education, and action-packed UFO combat.

---

## 🚀 Features

### 🌍 Core Experience

- **Interactive 3D Solar System**  
  Realistic 3D models of planets and the Sun with accurate scaling and spatial relationships
- **First-Person Space Navigation**  
  Smooth WASD controls with mouse look for immersive space exploration
- **Dynamic Movement System**
  - WASD for directional movement
  - Q/E for vertical movement
  - Shift for speed boost
  - Mouse for camera control

### 🎮 Gameplay Elements

- **Educational Quest System**  
  Learn about celestial bodies by exploring and interacting with them
- **UFO Combat Mission**  
  Defend the solar system against alien invaders after completing the educational quest
- **Weapon System**
  - Press F to activate combat mode
  - Left-click to fire laser weapons
  - Dynamic crosshair and targeting system

### ✨ Visual & Audio Features

- **Immersive Sound Design**
  - Ambient space music
  - Dynamic battle music
  - Interactive sound effects
  - Typewriter effect for text
- **Visual Effects**
  - Laser beam animations
  - Particle effects
  - Dynamic lighting
  - Screen-space effects
- **Responsive UI**
  - Real-time speed indicator
  - Health bars
  - Quest tracking
  - Interactive popups

---

## 🔧 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/)
- **3D Rendering**: [React Three.js](https://docs.pmnd.rs/react-three-fiber/getting-started) and [Three.js](https://threejs.org/)
- **UI Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks and Context API
- **Programming Languages**: TypeScript and JavaScript

---

## 🛠️ Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/universe-explorer-3d.git
   cd universe-explorer-3d
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the app in your browser:** Navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Exploration Phase**

   - Use WASD to move around the solar system
   - Click on planets to learn about them
   - Complete the quest by visiting all celestial bodies

2. **Combat Phase**

   - After completing the quest, a UFO will appear
   - Press F to activate combat mode
   - Use left-click to fire lasers at the UFO
   - Defeat the UFO to save the universe

3. **Post-Victory**
   - Continue exploring in free mode
   - Or restart the game for a new experience

## 🎨 Custom 3D Models

The application supports custom 3D models for planets. To use your own models:

1. Place your GLB model files in the `/public/models/` directory
2. Ensure your Earth model is named `earth.glb`
3. The application will automatically use your custom model

### Model Requirements

- Use GLB format (not separate GLTF files)
- Optimize models for web use (reasonable file size)
- Ensure proper center point for correct rotation

### Credits

Some planet models were created by Akshat and are licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

---

## 🎯 Future Enhancements

- Additional celestial bodies
- Enhanced combat mechanics
- More educational content
- Multiplayer capabilities
- Advanced visual effects

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
