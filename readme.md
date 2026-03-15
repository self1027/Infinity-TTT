# Modern Tic-Tac-Toe (Classic & Infinity)

A modern Tic-Tac-Toe implementation built with **Node.js**, **TypeScript**, and **Socket.io**. It features a minimalist design and an innovative **Infinity Mode**, where older pieces disappear to prevent draws.

## Features

* **Classic Mode**: The traditional 3x3 game experience.
* **Infinity Mode**: Each player is limited to 3 pieces on the board. Placing a 4th piece causes the oldest one to disappear.
* **Matchmaking**: Automated queue system segmented by game mode.
* **Private Rooms**: Create exclusive rooms to play with friends via room ID.
* **Dynamic Rematch**: Random symbol assignment (X or O) upon rematch to ensure fair starting conditions.
* **Minimalist UI**: Clean interface focused on usability with JetBrains Mono typography.

---

## Tech Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript.
* **Backend**: Node.js, TypeScript.
* **Communication**: Real-time messaging via Socket.io.
* **Architecture**: Strategy Pattern for game logic and centralized Server-Side State Management.

---

## Project Structure

```text
├── 📁 public           # Client-side (UI and Assets)
│   ├── 📁 js           # Local logic and WebSocket communication
│   ├── 🌐 index.html   # Main structure
│   └── 🎨 style.css    # Styling (Neo-brutalist approach)
├── 📁 src              # Server-side (TypeScript)
│   ├── 📁 core         # Business logic and Strategies (Game, Infinity)
│   ├── 📁 socket       # Room, Player, and Matchmaking management
│   └── 📄 index.ts     # Server entry point
└── ⚙️ tsconfig.json    # TypeScript compiler configuration

```

---

## Installation and Setup

1. **Install dependencies:**
```bash
npm install

```


2. **Run development server:**
```bash
npm run dev

```


3. **Access in browser:**
`http://localhost:3000`

---

## Code Architecture

The project follows **Clean Code** principles and **Evolutionary Refactoring**:

* **Early Returns**: State validations are handled at the beginning of functions to reduce conditional nesting.
* **Strategy Pattern**: Move processing and draw-checking logic are isolated into strategy classes, making it easy to add new game modes without modifying the core `Game` class.
* **Separation of Concerns**: `RoomManager` handles the room lifecycle, while `Matchmaker` focuses strictly on queue organization.

---

## Contributing

1. **Fork** the project.
2. Create a **Branch** for your feature (`git checkout -b feature/NewFeature`).
3. **Commit** your changes (`git commit -m 'Add: Feature description'`).
4. **Push** to the Branch (`git push origin feature/NewFeature`).
5. Open a **Pull Request**.

---

**Developed with Node.js and TypeScript.**
