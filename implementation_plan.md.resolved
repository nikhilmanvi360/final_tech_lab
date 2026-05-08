# Map Upgrades: Tactical Cyber-Forensic Mechanics

This document outlines the architectural changes required to implement the highly-requested tactical upgrades to the Phase 2 Newsroom map.

## User Review Required

> [!IMPORTANT]
> The proposed changes are significant and will alter the core gameplay loop of Phase 2. Please review the mechanics below to ensure they match your vision before I proceed with execution.

## Proposed Changes

### 1. Co-op Laser Grids & Pressure Plates (Upgrade 1)
- **Mechanic**: Add laser grids that block Field Agent movement.
- **Implementation**:
  - Add `laser` and `pressure_plate` entity types to `INITIAL_ENTITIES`.
  - Add a new shared state: `r2_lasers` to track which lasers are disabled.
  - The Intel Officer can click on a pressure plate on their map to temporarily disable the linked laser grid.
  - Update `isWall` logic to return `true` if a laser is active.

### 2. Distractions & Sound Lures (Upgrade 3)
- **Mechanic**: Intel Officer can trigger alarms to distract Sec-Bots.
- **Implementation**:
  - Add a "Trigger Lure" button on specific terminals or as a global cooldown ability for the Intel Officer.
  - Create a new shared state: `r2_lure` (stores coordinates `{x, y}` of the active lure).
  - Update the `setInterval` guard movement loop to make guards pathfind toward the lure if one is active, abandoning their normal patrol route temporarily.

### 3. "Among Us" Style Mini-Task Overlays (Upgrade 4)
- **Mechanic**: Asymmetric mini-games replacing standard terminal hacking.
- **Implementation**:
  - Add a new phase `minigame` to the `interactionState`.
  - Implement a **Wire Task Component**: 
    - The Field Agent sees a UI overlay with 4 colored wires to cut.
    - The Intel Officer sees a "Wire Defusal Manual" overlay with instructions on which to cut.
  - Success grants the clue and unlocks the terminal.

### 4. Direct Evidence Pinboard Integration (Upgrade 6)
- **Mechanic**: Map clues feed directly into the global evidence system.
- **Implementation**:
  - Import the `global_evidence` shared state into `Round2Page.tsx`.
  - Whenever a terminal is hacked or an NPC provides a final clue, automatically inject the finding into the Evidence Drawer using the exact data structure used in Round 1.

## Verification Plan

### Automated Tests
- TypeScript compilation to ensure new entity types and shared states don't break existing types.

### Manual Verification
- Test Field Agent movement against active vs disabled lasers.
- Test Intel Officer clicking pressure plates to sync state.
- Test Sec-Bot pathfinding toward lured coordinates.
- Test both sides of the Wire Task mini-game to ensure asymmetric views.
- Open the Evidence Pinboard after finding a clue to verify it appears.
