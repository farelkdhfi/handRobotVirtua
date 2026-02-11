# 🖐️ TouchlessOS - Hand Robot Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg?style=flat&logo=three.js&logoColor=white)
![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-4285F4.svg?style=flat&logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css)

**TouchlessOS** is a futuristic, gesture-controlled dashboard that leverages **Google MediaPipe** for hand tracking and **React Three Fiber** for immersive 3D visualizations. Featuring real-time skeletal mapping, interactive "Smart Cubes," and a dynamic performance optimization system.

> **Powered by On-Device AI.** Experience zero-latency hand tracking directly in your browser with WebAssembly (WASM) and GPU acceleration—no data is sent to the cloud.

---

## ✨ Key Features

### 🤖 AI & Computer Vision
* **Real-Time Tracking:** High-precision hand landmark detection using **MediaPipe Vision Tasks**.
* **Skeletal Overlay:** Visualizes your hand's internal structure on the webcam feed with neon aesthetics.
* **Gesture Recognition:** Detects pinch gestures (Thumb & Index) to trigger "Grab" and "Release" actions instantly.

### 🧊 Immersive 3D Interaction
* **Robotic Hand Model:** A procedurally generated 3D mech-hand that mimics your movements 1:1.
* **Smart Cubes:** Interactive 3D objects that react to your touch, change color, and can be physically moved.
* **Gamified Physics:** Sort cubes into matching colored zones (Zone A/B) to score points with particle explosion effects.

### ⚡ Performance & Optimization
* **Dynamic Quality Modes:** Switch between **Low** (Wireframe/Max FPS), **Medium** (Balanced), and **High** (Full PBR/Shadows) settings on the fly.
* **GPU Acceleration:** Utilizes WebGL delegates to ensure smooth 60 FPS rendering on supported devices.
* **Resource Management:** Smart loading states and efficient loop handling for minimal CPU usage.

### 🎨 Modern UI/UX
* **Glassmorphism Design:** A sleek dashboard overlay with frosted glass effects and crisp typography.
* **Live Metrics:** Real-time display of tracking confidence, active gestures, and coordinate data.
* **System Logs:** A terminal-style log feed showing AI status and interaction events.

---

## 🛠️ Tech Stack

* **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **3D Engine:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Drei](https://github.com/pmndrs/drei)
* **Computer Vision:** [MediaPipe Tasks Vision](https://developers.google.com/mediapipe)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Follow these steps to run TouchlessOS locally.

### Prerequisites

* Node.js (v16 or higher)
* Webcam connected to your device
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/farelkdhfi/handRobotVirtua.git](https://github.com/farelkdhfi/handRobotVirtua.git)
    cd handRobotVirtua
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open in browser**
    Navigate to `http://localhost:5173` and **allow camera access** when prompted.

---

## 📸 DEMO WEBSITE
https://hand-robot-virtual-3d.vercel.app/