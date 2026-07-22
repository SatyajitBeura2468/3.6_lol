<div align="center">

# THE DYNAMICS

### An immersive, interactive simulation of the Bernoulli principle

**Shape the flow. Watch pressure become motion.**

<br>

[![Launch The Dynamics](https://img.shields.io/badge/LAUNCH_THE_DYNAMICS-LIVE_SIMULATION-2ea8ff?style=for-the-badge&logo=vercel&logoColor=white&labelColor=111827)](https://the-dynamics.netlify.app)

<br>

</div>

---

## What is The Dynamics?

**The Dynamics** is a sophisticated, dependency-free, single-file web simulation that turns the Bernoulli principle and Venturi effect into an explorable visual laboratory.

Instead of merely displaying an equation, it lets you manipulate the system and watch continuity, velocity, pressure, elevation, viscosity, Reynolds number, and head loss interact in real time.

## Interactive laboratory

- Animated particle flow through a continuously changing Venturi tube
- Live pressure-field mapping from low to high static pressure
- Velocity vectors and streamlines
- Draggable throat geometry directly on the simulation canvas
- Water, air, and oil presets
- Adjustable flow rate, inlet diameter, constriction, elevation, density, and viscosity
- Optional Darcy-Weisbach-style head-loss approximation
- Live longitudinal pressure and velocity graph
- Local measurement probe for diameter, velocity, pressure, and Reynolds number
- Laminar, transitional, and turbulent regime detection
- Real-time pressure, kinetic, and potential energy accounting
- Snapshot export
- Responsive desktop and mobile layout
- Reduced-motion accessibility support

## Physics model

The simulation combines the continuity equation

```text
A₁v₁ = A₂v₂
```

with the Bernoulli relation

```text
P + ½ρv² + ρgh = constant
```

and an optional simplified viscous-loss model. It uses a quasi-one-dimensional incompressible approximation and is intended for education and conceptual exploration rather than engineering certification.

## Run locally

No build system, package manager, or installation ritual is required. Humanity briefly chose simplicity.

```bash
git clone https://github.com/SatyajitBeura2468/3.6_lol.git
cd 3.6_lol
```

Open `index.html` in a modern browser.

## Controls

| Action | Control |
|---|---|
| Pause or resume | `Space` |
| Reset experiment | `R` |
| Open guide | `H` |
| Inspect local values | Move pointer inside the tube |
| Reshape constriction | Drag vertically near the throat |

<div align="center">

### Built as a single HTML file.

**No frameworks. No dependencies. Just fluid dynamics and an unreasonable amount of animation.**

</div>