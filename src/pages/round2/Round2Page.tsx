import React, { useState, useEffect, useCallback } from "react";
import {
  Terminal,
  Key,
  Database,
  MessageSquare,
  User,
  UserCircle,
  ShieldAlert,
  Lock,
  Eye,
  Monitor,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  RadioReceiver,
  Settings,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useSharedState } from "../../hooks/useSharedState";
import { useOutletContext } from "react-router-dom";
import { api } from "../../services/api";
import { RoundCutscene } from "../../components/RoundCutscene";

const GRID_W = 36;
const GRID_H = 24;
const TILE_SIZE = 32; // Visual size in px (w-8 h-8 is 32px)
const VIEWPORT_W = 640;
const VIEWPORT_H = 480;
const LASER_OVERRIDE_MS = 8000;
const LURE_ACTIVE_MS = 10000;
const LURE_COOLDOWN_MS = 18000;

type DialogueOption = {
  text: string;
  nextNode?: string;
  clueRes?: string;
  end?: boolean;
};
type DialogueNode = { text: string; options: DialogueOption[] };
type InteractionPhase = "dialogue" | "terminal" | "minigame" | null;
type MinigameSession = { entityId: string; startedAt: number } | null;

export type FileSystemNode = {
  type: "file" | "dir";
  content?: string;
  children?: Record<string, FileSystemNode>;
};

type Entity = {
  id: string;
  x: number;
  y: number;
  type: "npc" | "terminal" | "item" | "door" | "guard" | "laser" | "pressure_plate" | "lure_trigger";
  name: string;

  // Dialogues
  dialogue?: Record<string, DialogueNode>;
  startNode?: string;
  requiredClues?: number;

  // Terminals
  fs?: Record<string, FileSystemNode>;
  expectedFile?: string;
  clue?: string;
  minigameType?: "wire" | "frequency" | "hex";

  // Items/Doors
  itemKey?: string;
  requiredKey?: string;

  // Guards
  path?: { x: number; y: number }[];
  pathIdx?: number;

  // Co-op Mechanics
  linkedLaserId?: string;
};

const INITIAL_ENTITIES: Entity[] = [
  // --- Zone A: Newsroom ---
  {
    id: "npc_dev",
    x: 2,
    y: 2,
    type: "npc",
    name: "Dev Sharma",
    startNode: "root",
    dialogue: {
      root: {
        text: "You shouldn't be here. Security is tight tonight.",
        options: [
          { text: "Tell me about Priya.", nextNode: "priya" },
          { text: "Who set up her laptop?", nextNode: "laptop" },
        ],
      },
      priya: {
        text: "She was scared. Texted me at 2:51 AM.",
        options: [{ text: "What did she say?", nextNode: "text_msg" }],
      },
      text_msg: {
        text: "'I have the names. All of them.' That's what she said.",
        options: [
          {
            text: "Got it.",
            end: true,
            clueRes: "Priya's final text log recovered.",
          },
        ],
      },
      laptop: {
        text: "Rohan did it. Two days before she started. Said it was routine.",
        options: [{ text: "I see. Bye.", end: true }],
      },
    },
  },
  {
    id: "term_priya",
    x: 5,
    y: 8,
    type: "terminal",
    name: "Priya's Desk Terminal",
    fs: {
      docs: {
        type: "dir",
        children: {
          "notes.txt": { type: "file", content: "Meeting with Ananya at 3pm." },
          "draft_v1.enc": { type: "file", content: "[ENCRYPTED DATA]" },
        },
      },
      sys: {
        type: "dir",
        children: {
          "auth.log": {
            type: "file",
            content:
              "Last login: April 12, 02:51 AM — session terminated remotely by API",
          },
        },
      },
    },
    expectedFile: "sys/auth.log",
    clue: "Terminal Log: Remote session termination detected.",
    minigameType: "wire",
  },
  {
    id: "key_it",
    x: 8,
    y: 2,
    type: "item",
    name: "IT Access Badge",
    itemKey: "KEY_IT",
  },
  {
    id: "door_it",
    x: 12,
    y: 5,
    type: "door",
    name: "Secure Door - IT Room",
    requiredKey: "KEY_IT",
  },

  // --- Zone B: IT Room ---
  {
    id: "npc_it",
    x: 18,
    y: 4,
    type: "npc",
    name: "IT Assistant",
    startNode: "root",
    dialogue: {
      root: {
        text: "Hey! How did you get in here? Wait, you're looking for the wiped drives?",
        options: [{ text: "Where's Rohan?", nextNode: "rohan" }],
      },
      rohan: {
        text: "He was in the server room that night. Badge log says he came in at 2:58. Left at 3:09.",
        options: [{ text: "What was he doing?", nextNode: "action" }],
      },
      action: {
        text: "Said he was fixing a backup error. At 3 in the morning...",
        options: [
          {
            text: "I'll check the logs.",
            end: true,
            clueRes: "Rohan's alibi: Server room from 2:58 to 3:09 AM.",
          },
        ],
      },
    },
  },
  {
    id: "term_server",
    x: 20,
    y: 8,
    type: "terminal",
    name: "Server Rack Terminal",
    fs: {
      var: {
        type: "dir",
        children: {
          log: {
            type: "dir",
            children: {
              "server_0412.txt": {
                type: "file",
                content:
                  "03:04:17 AM — REMOTE_WIPE_EXECUTED — API: 203.45.17.88",
              },
              "cron.log": { type: "file", content: "routine backups OK" },
            },
          },
        },
      },
    },
    expectedFile: "var/log/server_0412.txt",
    clue: "Server Log: WIPE Executed from 203.45.17.88.",
    minigameType: "frequency",
  },
  {
    id: "laser_1",
    x: 18,
    y: 8,
    type: "laser",
    name: "Security Laser Grid",
  },
  {
    id: "plate_1",
    x: 22,
    y: 4,
    type: "pressure_plate",
    name: "Laser Control Override",
    linkedLaserId: "laser_1",
  },
  {
    id: "lure_1",
    x: 16,
    y: 4,
    type: "lure_trigger",
    name: "Server Fire Alarm",
  },
  {
    id: "guard_1",
    x: 15,
    y: 10,
    type: "guard",
    name: "Sec-Bot Alpha",
    path: [
      { x: 15, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 8 },
      { x: 15, y: 8 },
    ],
    pathIdx: 0,
  },
  {
    id: "door_archive",
    x: 12,
    y: 18,
    type: "door",
    name: "Archive Vault Door",
    requiredKey: "KEY_ARCHIVE",
  },

  // --- Zone C: Editor's Office ---
  {
    id: "item_archive",
    x: 4,
    y: 20,
    type: "item",
    name: "Archive Override Key",
    itemKey: "KEY_ARCHIVE",
  },
  {
    id: "npc_ananya",
    x: 6,
    y: 18,
    type: "npc",
    name: "Ananya Bose (Editor)",
    requiredClues: 3,
    startNode: "root",
    dialogue: {
      root: {
        text: "You found something? I told her to be careful...",
        options: [{ text: "Tell me about the story.", nextNode: "story" }],
      },
      story: {
        text: "Coastal Highway Project. ₹47 crore. Vikram Sundaram's firm. Shell companies.",
        options: [{ text: "Did she have proof?", nextNode: "proof" }],
      },
      proof: {
        text: "Yes. ARCHIVE had it all backed up. The police closed the case in 48 hours without checking it.",
        options: [
          {
            text: "I'll find it.",
            end: true,
            clueRes: "Editor Confession: Police ignored ARCHIVE.",
          },
        ],
      },
    },
  },
  {
    id: "guard_2",
    x: 8,
    y: 15,
    type: "guard",
    name: "Sec-Bot Beta",
    path: [
      { x: 8, y: 15 },
      { x: 8, y: 20 },
      { x: 4, y: 20 },
      { x: 4, y: 15 },
    ],
    pathIdx: 0,
  },

  // New Door to Zone F
  {
    id: "door_garage",
    x: 12,
    y: 22,
    type: "door",
    name: "Garage Access",
    requiredKey: "KEY_GARAGE",
  },

  // --- Zone D: Archive Vault ---
  {
    id: "term_archive",
    x: 20,
    y: 20,
    type: "terminal",
    name: "Archive Vault Terminal",
    fs: {
      backups: {
        type: "dir",
        children: {
          "draft_bridge_FINAL.enc": {
            type: "file",
            content:
              "DECRYPTED: The contractor who signed off was Vikram Sundaram. The CEO approved the bribe at 2:00 AM.",
          },
          "keys.txt": {
            type: "file",
            content:
              "Sys Admin: Use EC-Q7R8 to decrypt. The CEO's suite pin is 8042.",
          },
        },
      },
    },
    expectedFile: "backups/draft_bridge_FINAL.enc",
    clue: 'Final Draft Recovered: "The contractor who signed off was Vikram Sundaram."',
  },
  {
    id: "item_exec",
    x: 18,
    y: 14,
    type: "item",
    name: "Executive Suite Keycard",
    itemKey: "KEY_EXEC",
  },
  {
    id: "door_exec",
    x: 24,
    y: 5,
    type: "door",
    name: "Executive Suite Door",
    requiredKey: "KEY_EXEC",
  },

  // --- Zone E: Executive Suite ---
  {
    id: "npc_ceo",
    x: 30,
    y: 4,
    type: "npc",
    name: "Vikram Sundaram (CEO)",
    requiredClues: 4,
    startNode: "root",
    dialogue: {
      root: {
        text: "How did you bypass my guards? I paid Inspector Varma good money to close this.",
        options: [{ text: "It's over, Sundaram.", nextNode: "confess" }],
      },
      confess: {
        text: "Over? I own the network. I sent the Kill Signal from my personal terminal right here.",
        options: [
          {
            text: "I'm downloading your logs now.",
            end: true,
            clueRes: "CEO Confession: Ordered the remote wipe.",
          },
        ],
      },
    },
  },
  {
    id: "term_ceo",
    x: 32,
    y: 8,
    type: "terminal",
    name: "CEO's Private Terminal",
    fs: {
      private: {
        type: "dir",
        children: {
          "offshore.csv": {
            type: "file",
            content: "TRANSFER: ₹800,000 to Acc#77492 (R. VARMA)",
          },
          "directive.txt": {
            type: "file",
            content:
              "To: R. Dasgupta. \nMessage: Execute cleanup_routine(). Now.",
          },
        },
      },
    },
    expectedFile: "private/directive.txt",
    clue: "CEO Directive: Explicit order to execute wipe routine found.",
    minigameType: "hex",
  },
  {
    id: "guard_3",
    x: 26,
    y: 6,
    type: "guard",
    name: "Elite Sec-Bot",
    path: [
      { x: 26, y: 6 },
      { x: 34, y: 6 },
      { x: 34, y: 10 },
      { x: 26, y: 10 },
    ],
    pathIdx: 0,
  },

  // --- Zone F: Underground Garage ---
  {
    id: "item_garage",
    x: 28,
    y: 14,
    type: "item",
    name: "Garage Keycard",
    itemKey: "KEY_GARAGE",
  },
  {
    id: "term_cctv",
    x: 32,
    y: 20,
    type: "terminal",
    name: "CCTV Control Terminal",
    fs: {
      feeds: {
        type: "dir",
        children: {
          "cam_04.mp4": {
            type: "file",
            content:
              "PLAYING: Inspector Varma seen taking a duffel bag from Sundaram's driver at 4:10 AM.",
          },
        },
      },
    },
    expectedFile: "feeds/cam_04.mp4",
    clue: "CCTV Footage: Inspector Varma receiving payoff.",
  },
  {
    id: "guard_4",
    x: 25,
    y: 15,
    type: "guard",
    name: "Elite Sec-Bot",
    path: [
      { x: 25, y: 15 },
      { x: 25, y: 22 },
      { x: 30, y: 22 },
      { x: 30, y: 15 },
    ],
    pathIdx: 0,
  },
];

export function Round2Page() {
  const { team } = useOutletContext<{ team: any }>();
  const isIntel = team?.playerRole?.includes("Intel");
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <RoundCutscene
        roundNumber={2}
        title="Newsroom Infiltration"
        subtitle="Physical Site Breach"
        description={[
          "Bypassing physical security protocols...",
          "Warning: Newsroom floor is patrolled by Sec-Bot Alphas.",
          "Note: Intel Officers can see bot paths and hidden clues, Field Agents cannot.",
          "Mission: Infiltrate the server room, recover wiped drive logs, and bypass the laser grid.",
          "Objective: Collect 5 key evidence links and confront the Editor."
        ]}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  const [removedEntities, setRemovedEntities] = useSharedState<string[]>(
    "r2_removed",
    [],
  );
  const [entities, setEntities] = useSharedState<Entity[]>("r2_entities", INITIAL_ENTITIES);

  // Compute true entities
  const displayEntities = entities.filter(
    (e) => !removedEntities.includes(e.id),
  );

  const [playerPos, setPlayerPos] = useSharedState("r2_pos", { x: 1, y: 1 });
  const [inventory, setInventory] = useSharedState<string[]>("r2_inv", []);
  const [clues, setClues] = useSharedState<string[]>("r2_clues", []);
  const [disabledLasers, setDisabledLasers] = useSharedState<string[]>(
    "r2_lasers",
    [],
  );
  const [solvedTerminals, setSolvedTerminals] = useSharedState<string[]>(
    "r2_solved_terminals",
    [],
  );
  const [activeLure, setActiveLure] = useSharedState<{
    x: number;
    y: number;
    id: string;
  } | null>("r2_lure", null);
  const [lureCooldownUntil, setLureCooldownUntil] = useSharedState<number>(
    "r2_lure_cooldown_until",
    0,
  );
  const [minigameSession, setMinigameSession] =
    useSharedState<MinigameSession>("r2_minigame_session", null);
  const [globalEvidence, setGlobalEvidence] = useSharedState<any[]>(
    "global_evidence",
    [],
  );

  const [interactionState, setInteractionState] = useState<{
    entity: Entity | null;
    phase: InteractionPhase;
    currentNodeId: string;
    terminalInput: string;
    terminalOutput: string[];
    terminalPwd: string[];
    terminalSuccess: boolean;
    minigameData?: any;
  }>({
    entity: null,
    phase: null,
    currentNodeId: "",
    terminalInput: "",
    terminalOutput: [],
    terminalPwd: [],
    terminalSuccess: false,
  });

  const getEntityAt = (x: number, y: number) => {
    return displayEntities.find(
      (e) =>
        Math.abs(e.x - x) <= 1 &&
        Math.abs(e.y - y) <= 1 &&
        (e.type === "item" || e.type === "npc" || e.type === "terminal"),
    );
  };

  const isWall = (x: number, y: number) => {
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return true;

    // Vertical dividers
    if (x === 12 && y !== 5 && y !== 18 && y !== 22) return true;
    if (x === 24 && y !== 5 && y !== 18) return true;

    // Horizontal dividers
    if (y === 12 && x !== 5 && x !== 18 && x !== 29) return true;

    const door = displayEntities.find(
      (e) => e.x === x && e.y === y && e.type === "door",
    );
    if (door && (!door.requiredKey || !inventory.includes(door.requiredKey)))
      return true;

    const laser = displayEntities.find(
      (e) => e.x === x && e.y === y && e.type === "laser",
    );
    if (laser && !disabledLasers.includes(laser.id)) return true;

    return false;
  };

  const checkGuardCollision = useCallback(() => {
    if (isIntel) return; // Only Field Agent checks guards
    const hitGuard = displayEntities.find(
      (e) =>
        e.type === "guard" &&
        Math.abs(e.x - playerPos.x) <= 1 &&
        Math.abs(e.y - playerPos.y) <= 1,
    );
    if (hitGuard) {
      toast.error("Spotted! Resetting position...");
      setPlayerPos({ x: 1, y: 1 });
    }
  }, [displayEntities, playerPos, setPlayerPos, isIntel]);

  useEffect(() => {
    if (isIntel) return; // ONLY the Field Agent processes the game loop to prevent double-updates and drift
    const interval = setInterval(() => {
      setEntities((prev) =>
        prev.map((e) => {
          if (e.type === "guard") {
            // Check for lure distraction
            if (activeLure) {
              const dx = activeLure.x - e.x;
              const dy = activeLure.y - e.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist <= 6) {
                // Move towards lure
                const nextX = e.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
                const nextY = e.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
                // Keep distracted guards inside the tactical grid.
                if (nextX >= 0 && nextX < GRID_W && nextY >= 0 && nextY < GRID_H) {
                  return { ...e, x: nextX, y: nextY };
                }
              }
            }

            if (e.path && e.path.length > 0) {
              const nextIdx = (e.pathIdx! + 1) % e.path.length;
              const nextPos = e.path[nextIdx];
              return { ...e, x: nextPos.x, y: nextPos.y, pathIdx: nextIdx };
            }
          }
          return e;
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLure, isIntel, setEntities]);

  useEffect(() => {
    checkGuardCollision();
  }, [playerPos, displayEntities, checkGuardCollision]);

  const buildMinigameData = (type?: Entity["minigameType"]) => {
    if (type === "wire") {
      return { wires: ["red", "green", "blue", "yellow"], solution: "green" };
    }
    if (type === "frequency") return { current: 0, target: 440 };
    if (type === "hex") return { hex: "E5-C9-F2" };
    return undefined;
  };

  const openInteraction = useCallback(
    (entity: Entity) => {
      const terminalSolved =
        entity.type === "terminal" && solvedTerminals.includes(entity.id);
      const phase: InteractionPhase =
        entity.type === "terminal"
          ? entity.minigameType && !terminalSolved
            ? "minigame"
            : "terminal"
          : "dialogue";

      setInteractionState((prev) => ({
        ...prev,
        entity,
        phase,
        currentNodeId: entity.startNode || "root",
        terminalInput: "",
        terminalOutput: [
          "Welcome to TT_OS Shell.",
          'Type "help" for a list of commands.',
        ],
        terminalPwd: [],
        terminalSuccess: terminalSolved || clues.includes(entity.clue || ""),
        minigameData: buildMinigameData(entity.minigameType),
      }));

      if (!isIntel && phase === "minigame") {
        setMinigameSession({ entityId: entity.id, startedAt: Date.now() });
      }
    },
    [clues, isIntel, setMinigameSession, solvedTerminals],
  );

  useEffect(() => {
    if (!isIntel || !minigameSession) return;
    if (
      interactionState.phase === "minigame" &&
      interactionState.entity?.id === minigameSession.entityId
    ) {
      return;
    }

    const entity = displayEntities.find(
      (e) => e.id === minigameSession.entityId && e.type === "terminal",
    );
    if (entity && !solvedTerminals.includes(entity.id)) {
      setInteractionState((prev) => ({
        ...prev,
        entity,
        phase: "minigame",
        currentNodeId: entity.startNode || "root",
        terminalInput: "",
        terminalOutput: [
          "Welcome to TT_OS Shell.",
          'Type "help" for a list of commands.',
        ],
        terminalPwd: [],
        terminalSuccess: false,
        minigameData: buildMinigameData(entity.minigameType),
      }));
    }
  }, [
    displayEntities,
    interactionState.entity?.id,
    interactionState.phase,
    isIntel,
    minigameSession,
    solvedTerminals,
  ]);

  useEffect(() => {
    if (!minigameSession) return;
    if (solvedTerminals.includes(minigameSession.entityId)) {
      setMinigameSession(null);
      if (
        isIntel &&
        interactionState.phase === "minigame" &&
        interactionState.entity?.id === minigameSession.entityId
      ) {
        setInteractionState({
          entity: null,
          phase: null,
          currentNodeId: "",
          terminalInput: "",
          terminalOutput: [],
          terminalPwd: [],
          terminalSuccess: false,
        });
      }
    }
  }, [
    interactionState.entity?.id,
    interactionState.phase,
    isIntel,
    minigameSession,
    setMinigameSession,
    solvedTerminals,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only Field Agent moves
      if (isIntel || interactionState.phase) return;

      let newX = playerPos.x;
      let newY = playerPos.y;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          newY -= 1;
          break;
        case "ArrowDown":
        case "s":
          newY += 1;
          break;
        case "ArrowLeft":
        case "a":
          newX -= 1;
          break;
        case "ArrowRight":
        case "d":
          newX += 1;
          break;
        case "e":
        case "E":
          const entity = getEntityAt(playerPos.x, playerPos.y);
          if (entity) {
            if (entity.type === "item") {
              if (entity.itemKey)
                setInventory((prev) => [...prev, entity.itemKey!]);
              setRemovedEntities((prev) => [...prev, entity.id]);
            } else {
              openInteraction(entity);
            }
          }
          return;
        default:
          return;
      }

      if (!isWall(newX, newY)) {
        setPlayerPos({ x: newX, y: newY });
        const doorOnCell = displayEntities.find(
          (en) => en.x === newX && en.y === newY && en.type === "door",
        );
        if (doorOnCell) {
          setRemovedEntities((prev) => [...prev, doorOnCell.id]);
        }
      }
    },
    [
      playerPos,
      interactionState.phase,
      displayEntities,
      inventory,
      setPlayerPos,
      setRemovedEntities,
      setInventory,
      isIntel,
      openInteraction,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const closeInteraction = () => {
    if (
      !isIntel &&
      interactionState.phase === "minigame" &&
      minigameSession?.entityId === interactionState.entity?.id
    ) {
      setMinigameSession(null);
    }

    setInteractionState({
      entity: null,
      phase: null,
      currentNodeId: "",
      terminalInput: "",
      terminalOutput: [],
      terminalPwd: [],
      terminalSuccess: false,
    });
  };

  const addEvidence = (
    id: string,
    source: string,
    summary: string,
    details: string,
  ) => {
    setGlobalEvidence(prev => {
      if (prev?.find((e: any) => e.id === id)) return prev;
      return [
        ...(prev || []),
        {
          id,
          source,
          summary,
          details,
          status: "new" as const,
        },
      ];
    });
  };

  const completeMinigame = () => {
    const { entity } = interactionState;
    if (!entity) return;

    setSolvedTerminals((prev) =>
      prev.includes(entity.id) ? prev : [...prev, entity.id],
    );
    setMinigameSession(null);

    if (entity.clue) {
      setClues((prev) =>
        prev.includes(entity.clue!) ? prev : [...prev, entity.clue!],
      );
      addEvidence(
        entity.id,
        `Round 2: ${entity.name}`,
        entity.clue,
        "Recovered via tactical infiltration and terminal hack.",
      );
      
      toast.success("EVIDENCE PINBOARD UPDATED", {
        description: entity.clue
      });

      api
        .post("/api/r0/submit", { task: `clue_${entity.clue}` })
        .catch(() => {});
    }

    setInteractionState(prev => ({
      ...prev,
      phase: "terminal", 
      terminalSuccess: true
    }));
  };

  const selectDialogueOption = (opt: DialogueOption) => {
    if (opt.clueRes) {
      setClues((prev) =>
        prev.includes(opt.clueRes!) ? prev : [...prev, opt.clueRes!],
      );
      addEvidence(
        `clue_${opt.clueRes}`,
        `Round 2: ${interactionState.entity?.name || 'Inquiry'}`,
        opt.clueRes,
        "Obtained through witness interrogation.",
      );

      toast.success("EVIDENCE PINBOARD UPDATED", {
        description: opt.clueRes
      });

      api
        .post("/api/r2/claim", { task: `clue_${opt.clueRes}` })
        .catch(() => {});
    }
    if (opt.end || !opt.nextNode) {
      closeInteraction();
    } else {
      setInteractionState((prev) => ({
        ...prev,
        currentNodeId: opt.nextNode!,
      }));
    }
  };

  const getDirNode = (fs: any, pwd: string[]) => {
    let node = fs;
    for (const p of pwd) {
      if (!node || node[p]?.type !== "dir") return null;
      node = node[p].children;
    }
    return node;
  };

  const submitTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    const { entity, terminalInput, terminalPwd, terminalOutput } =
      interactionState;
    if (!entity || !entity.fs) return;

    const args = terminalInput.trim().split(" ").filter(Boolean);
    const cmd = args[0];
    let newOutput = [
      ...terminalOutput,
      `root@sys:/${terminalPwd.join("/")}# ${terminalInput}`,
    ];
    let newPwd = [...terminalPwd];

    if (cmd === "help") {
      newOutput.push("Available commands: ls, cd, cat, clear");
    } else if (cmd === "clear") {
      newOutput = [];
    } else if (cmd === "ls") {
      const dir = getDirNode(entity.fs, terminalPwd);
      if (dir) {
        const contents = Object.keys(dir)
          .map((k) => (dir[k].type === "dir" ? `${k}/` : k))
          .join("  ");
        newOutput.push(contents || "(empty directory)");
      } else {
        newOutput.push("Error reading directory.");
      }
    } else if (cmd === "cd") {
      if (!args[1] || args[1] === "/") {
        newPwd = [];
      } else if (args[1] === "..") {
        newPwd.pop();
      } else {
        const dir = getDirNode(entity.fs, terminalPwd);
        if (dir && dir[args[1]] && dir[args[1]].type === "dir") {
          newPwd.push(args[1]);
        } else {
          newOutput.push(`cd: ${args[1]}: No such directory`);
        }
      }
    } else if (cmd === "cat") {
      if (!args[1]) {
        newOutput.push("cat: missing operand");
      } else {
        const targetPathStr = args[1];
        let targetPwd = [...terminalPwd];
        let filename = targetPathStr;

        if (targetPathStr.includes("/")) {
          const parts = targetPathStr.split("/");
          filename = parts.pop()!;
          for (const p of parts) {
            if (p === "") {
              targetPwd = [];
              continue;
            }
            if (p === "..") {
              targetPwd.pop();
              continue;
            }
            targetPwd.push(p);
          }
        }

        const dir = getDirNode(entity.fs, targetPwd);
        if (dir && dir[filename] && dir[filename].type === "file") {
          newOutput.push(dir[filename].content || "");
          const fullPathJoined =
            targetPwd.length > 0
              ? `${targetPwd.join("/")}/${filename}`
              : filename;
          if (fullPathJoined === entity.expectedFile) {
            setSolvedTerminals((prev) =>
              prev.includes(entity.id) ? prev : [...prev, entity.id],
            );
            if (entity.clue) {
              setClues((prev) =>
                prev.includes(entity.clue!) ? prev : [...prev, entity.clue!],
              );
              addEvidence(
                entity.id,
                `Round 2: ${entity.name}`,
                entity.clue,
                "Recovered by locating and extracting the target terminal file.",
              );
              toast.success("EVIDENCE PINBOARD UPDATED", {
                description: entity.clue
              });
              api
                .post("/api/r2/claim", { task: `clue_${entity.clue}` })
                .catch(() => {});
            }
            newOutput.push("\n[!] CRITICAL DATA EXTRACTED.");
          }
        } else {
          newOutput.push(`cat: ${args[1]}: No such file`);
        }
      }
    } else if (cmd) {
      newOutput.push(`bash: ${cmd}: command not found`);
    }

    setInteractionState((prev) => ({
      ...prev,
      terminalInput: "",
      terminalOutput: newOutput,
      terminalPwd: newPwd,
    }));
  };

  // Rendering the grid view
  const renderGrid = () => {
    const tiles = [];
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        let isPlayer = playerPos.x === x && playerPos.y === y;
        let isWallTile = isWall(x, y);
        let entity = displayEntities.find(
          (e) => e.x === x && e.y === y && e.type !== "guard",
        );
        let guard = isIntel
          ? entities.find((e) => e.type === "guard" && e.x === x && e.y === y)
          : null;

        let bgClass = "";
        if (x < 12 && y < 12)
          bgClass = "bg-[#140e0a] border-orange-500/20"; // Zone A
        else if (x >= 12 && x < 24 && y < 12)
          bgClass = "bg-[#0a1014] border-blue-500/20"; // Zone B
        else if (x < 12 && y >= 12)
          bgClass = "bg-[#0e140a] border-green-500/20"; // Zone C
        else if (x >= 12 && x < 24 && y >= 12)
          bgClass = "bg-[#140a0e] border-red-500/20"; // Zone D
        else if (x >= 24 && y < 12)
          bgClass = "bg-[#120a14] border-purple-500/20"; // Zone E
        else bgClass = "bg-[#0a0e14] border-cyan-500/20"; // Zone F

        if (isWallTile && !entity) bgClass = "bg-black border-border/80 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]";

        let onTileClick = undefined;
        if (isIntel) {
          if (entity?.type === "pressure_plate") {
            onTileClick = () => {
              if (entity.linkedLaserId) {
                const laserId = entity.linkedLaserId;
                if (disabledLasers.includes(laserId)) {
                  toast.message("Laser override already active.");
                  return;
                }

                setDisabledLasers(prev =>
                  prev.includes(laserId) ? prev : [...prev, laserId],
                );
                toast.success("Security Laser DE-ACTIVATED", {
                  description: "Override window is temporary.",
                });
                setTimeout(() => {
                  setDisabledLasers(prev => prev.filter(id => id !== laserId));
                }, LASER_OVERRIDE_MS);
              }
            };
          } else if (entity?.type === "lure_trigger") {
            onTileClick = () => {
              const now = Date.now();
              if (activeLure || now < lureCooldownUntil) {
                const remainingMs = activeLure
                  ? LURE_ACTIVE_MS
                  : Math.max(0, lureCooldownUntil - now);
                toast.error("Lure system on cooldown...", {
                  description: `${Math.ceil(remainingMs / 1000)}s remaining`,
                });
              } else {
                setLureCooldownUntil(now + LURE_COOLDOWN_MS);
                setActiveLure({x, y, id: entity.id});
                toast.warning(`ALARM TRIGGERED AT (${x}, ${y})!`);
                setTimeout(() => {
                  setActiveLure(prev => prev?.id === entity.id ? null : prev);
                }, LURE_ACTIVE_MS);
              }
            };
          }
        }

        tiles.push(
          <div
            key={`${x}-${y}`}
            onClick={onTileClick}
            className={`w-8 h-8 border-[0.5px] flex items-center justify-center relative ${bgClass} ${onTileClick ? 'cursor-pointer hover:bg-white/10' : ''}`}
          >
            {isWallTile && entity?.type === "door" && (
              <Lock className="w-5 h-5 text-red-500/70" />
            )}
            {isPlayer && (
              <User className="w-6 h-6 text-red-500 z-10 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
            )}
            {entity && entity.type === "npc" && (
              <UserCircle className="w-6 h-6 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
            )}
            {entity && entity.type === "terminal" && (
              <Monitor className="w-5 h-5 text-gold drop-shadow-[0_0_5px_rgba(212,160,23,0.8)]" />
            )}
            {entity && entity.type === "item" && (
              <Key className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
            )}
            {entity && entity.type === "laser" && (
              <div className={`absolute inset-0 z-20 flex items-center justify-center ${disabledLasers.includes(entity.id) ? 'opacity-20' : 'opacity-100'}`}>
                <div className="w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                <Lock className="w-3 h-3 text-red-500 absolute" />
              </div>
            )}
            {entity && entity.type === "pressure_plate" && (
              <Square className={`w-5 h-5 ${disabledLasers.includes(entity.linkedLaserId || '') ? 'text-green-500' : 'text-blue-500'} drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]`} />
            )}
            {entity && entity.type === "lure_trigger" && (
              <RadioReceiver className="w-5 h-5 text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] animate-pulse" />
            )}
            {activeLure && activeLure.x === x && activeLure.y === y && (
               <div className="absolute inset-0 z-10 animate-ping bg-purple-500/30 rounded-full" />
            )}
            {guard && (
              <Eye className="w-6 h-6 text-red-700 z-[5] animate-pulse drop-shadow-[0_0_8px_darkred]" />
            )}
          </div>,
        );
      }
    }
    return tiles;
  };

  const endOfTerminalRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactionState.terminalOutput]);

  return (
    <div className="h-full flex flex-col pt-2 pb-8 max-w-[1200px] w-full mx-auto px-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-6 h-6" /> Terminal Recon.
          </h1>
          <p className="text-muted text-sm uppercase">
            {isIntel
              ? "INTEL OFFICER: YOU ARE OVERWATCH. GUIDE THE FIELD AGENT (BLIND TO BOTS)."
              : "FIELD AGENT: USE WASD TO MOVE. YOU ARE BLIND TO BOTS. LISTEN TO INTEL."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-red-500 font-bold bg-red-900/20 px-4 py-1 flex items-center gap-2 border border-red-500/30">
            <ShieldAlert className="w-4 h-4" /> TR: V. SUNDARAM
          </div>
          <div className="text-right">
            <p className="font-bold text-gold text-xs tracking-widest uppercase">
              Clues Acquired
            </p>
            <p className="text-2xl font-mono text-gold">{clues.length} / 6</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Game Canvas */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Viewport Container */}
          <div 
            className="border-[3px] border-border p-0 bg-[#050505] relative overflow-hidden shadow-[0_0_40px_rgba(212,160,23,0.15)] shrink-0 self-start"
            style={{ width: VIEWPORT_W, height: VIEWPORT_H }}
          >
            {/* Fog of War Overlay */}
            <div 
              className="absolute inset-0 z-40 pointer-events-none transition-all duration-300"
              style={{
                background: `radial-gradient(circle at ${
                  VIEWPORT_W / 2
                }px ${
                  VIEWPORT_H / 2
                }px, transparent ${isIntel ? '150px' : '80px'}, rgba(0,0,0,0.95) ${isIntel ? '350px' : '200px'})`
              }}
            />

            {/* Scanning Line Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-overlay"></div>

            {/* Inner Map Container */}
            <div 
              className="absolute top-0 left-0 transition-transform duration-300 ease-out"
              style={{
                width: GRID_W * TILE_SIZE,
                height: GRID_H * TILE_SIZE,
                transform: `translate(${
                  VIEWPORT_W / 2 - (playerPos.x * TILE_SIZE + TILE_SIZE / 2)
                }px, ${
                  VIEWPORT_H / 2 - (playerPos.y * TILE_SIZE + TILE_SIZE / 2)
                }px)`
              }}
            >
              <div className="grid grid-cols-[repeat(36,_minmax(0,_1fr))] gap-0 relative bg-black w-full h-full">
                {renderGrid()}
              </div>

              {/* Zone LabelsOverlay */}
              <div className="absolute top-8 left-8 text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                Newsroom
              </div>
              <div className="absolute top-8 left-[35%] text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                IT Room
              </div>
              <div className="absolute bottom-8 left-8 text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                Editor
              </div>
              <div className="absolute bottom-8 left-[35%] text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                Archives
              </div>
              <div className="absolute top-8 right-8 text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                Exec Suite
              </div>
              <div className="absolute bottom-8 right-8 text-white/10 font-bold uppercase tracking-widest pointer-events-none text-4xl mix-blend-screen">
                Garage
              </div>
            </div>
          </div>

          {/* Keybinds / D-PAD */}
          <div className="flex items-center justify-between bg-[#050505] border border-border/50 p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-3 gap-2 w-[150px]">
              <div />
              <button
                onClick={() => handleKeyDown({ key: "ArrowUp", preventDefault: () => {} } as KeyboardEvent)}
                className="bg-blue-900/10 hover:bg-blue-500/20 border-t border-x border-blue-500/30 p-2 flex justify-center items-center text-blue-400 transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div />
              <button
                onClick={() => handleKeyDown({ key: "ArrowLeft", preventDefault: () => {} } as KeyboardEvent)}
                className="bg-blue-900/10 hover:bg-blue-500/20 border-l border-y border-blue-500/30 p-2 flex justify-center items-center text-blue-400 transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleKeyDown({ key: "ArrowDown", preventDefault: () => {} } as KeyboardEvent)}
                className="bg-blue-900/10 hover:bg-blue-500/20 border-b border-x border-blue-500/30 p-2 flex justify-center items-center text-blue-400 transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleKeyDown({ key: "ArrowRight", preventDefault: () => {} } as KeyboardEvent)}
                className="bg-blue-900/10 hover:bg-blue-500/20 border-r border-y border-blue-500/30 p-2 flex justify-center items-center text-blue-400 transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleKeyDown({ key: "e", preventDefault: () => {} } as KeyboardEvent)}
                className="w-[70px] h-[70px] rounded-full border-2 border-red-500/50 bg-red-950/40 flex items-center justify-center hover:bg-red-900/60 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all text-red-500 font-bold text-2xl tracking-widest active:scale-90"
              >
                E
              </button>
              <div className="text-red-500/70 text-xs uppercase tracking-[0.2em] font-mono">
                Interact
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="border border-border bg-black/40 p-4">
            <h3 className="font-bold text-gold border-b border-border pb-2 mb-2 uppercase">
              Decrypted Logs
            </h3>
            {clues.length === 0 ? (
              <p className="text-muted text-sm italic">
                No data recovered yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {clues.map((c, idx) => (
                  <li
                    key={idx}
                    className="text-sm font-mono text-green-400 bg-green-900/10 p-2 border-l-2 border-green-500"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border border-border bg-black/40 p-4">
            <h3 className="font-bold text-blue-400 border-b border-border pb-2 mb-2 uppercase flex items-center gap-2">
              Inventory
            </h3>
            {inventory.length === 0 ? (
              <p className="text-muted text-sm italic">Inventory empty.</p>
            ) : (
              <ul className="flex gap-2 flex-wrap">
                {inventory.map((inv, idx) => (
                  <li
                    key={idx}
                    className="text-xs font-bold text-black bg-blue-400 px-2 py-1 uppercase rounded-sm"
                  >
                    {inv}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Interaction Modal */}
      {interactionState.phase && interactionState.entity && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#140e06] border border-gold p-6 relative shadow-[0_0_30px_rgba(212,160,23,0.15)] font-mono">
            {interactionState.phase === "dialogue" && (
              <>
                <div className="flex items-center gap-3 border-b border-gold/30 pb-4 mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-400 uppercase">
                    {interactionState.entity.name}
                  </h3>
                </div>

                {interactionState.entity.requiredClues &&
                clues.length < interactionState.entity.requiredClues ? (
                  <div className="text-body text-lg leading-relaxed mb-8 min-h-[80px]">
                    "I've told the police everything I know. Come back when you
                    have something concrete."
                  </div>
                ) : (
                  <>
                    <div className="text-body text-lg leading-relaxed mb-8 min-h-[80px]">
                      {
                        interactionState.entity.dialogue![
                          interactionState.currentNodeId
                        ]?.text
                      }
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                      {interactionState.entity.dialogue![
                        interactionState.currentNodeId
                      ]?.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => selectDialogueOption(opt)}
                          className="text-left px-4 py-3 bg-blue-900/20 border border-blue-500/50 text-blue-400 hover:bg-blue-900/50 hover:border-blue-400 transition"
                        >
                          &gt; {opt.text}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gold/30">
                  <button
                    onClick={closeInteraction}
                    className="px-6 py-2 border border-border text-muted hover:text-white uppercase transition"
                  >
                    Walk Away
                  </button>
                </div>
              </>
            )}

            {interactionState.phase === "minigame" && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 border-b border-gold/30 pb-4 mb-4 w-full">
                  <Zap className="w-6 h-6 text-gold animate-pulse" />
                  <h3 className="text-xl font-bold text-gold uppercase">
                    SYS_OVERRIDE: {interactionState.entity.name}
                  </h3>
                </div>

                <div className="bg-black/50 border border-gold/30 p-8 w-full min-h-[300px] flex flex-col items-center justify-center">
                   {interactionState.entity.minigameType === "wire" && (
                     <div className="flex flex-col items-center gap-8">
                       <h4 className="text-red-400 font-bold uppercase tracking-[0.2em] mb-4">Manual Override: Cut correctly</h4>
                       {isIntel ? (
                         <div className="bg-red-900/20 border border-red-500/50 p-6 text-center">
                            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-4" />
                            <p className="text-red-100 text-sm mb-4">INTEL MANUAL: To bypass Priya's Desk encryption, the operative must cut the <span className="font-bold text-red-400">GREEN</span> wire.</p>
                            <p className="text-xs text-red-500/70 italic">Communicate this to the Field Agent immediately.</p>
                         </div>
                       ) : (
                         <div className="flex gap-4">
                           {interactionState.minigameData?.wires.map((color: string) => (
                             <button
                               key={color}
                               onClick={() => {
                                 if (color === interactionState.minigameData.solution) {
                                   toast.success("HACK SUCCESSFUL");
                                   completeMinigame();
                                 } else {
                                   toast.error("WAVEFORM RESET: INCORRECT WIRE");
                                   closeInteraction();
                                 }
                               }}
                               className={`w-4 h-32 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-black/50 hover:scale-105 transition-all`}
                               style={{ backgroundColor: color }}
                             />
                           ))}
                         </div>
                       )}
                     </div>
                   )}

                   {interactionState.entity.minigameType === "frequency" && (
                     <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                       <h4 className="text-blue-400 font-bold uppercase tracking-[0.2em]">Frequency Match</h4>
                       {isIntel ? (
                         <div className="w-full space-y-4">
                           <div className="bg-blue-900/20 border border-blue-500/50 p-4 text-center">
                             <p className="text-xs text-blue-300 uppercase mb-2">Target Frequency</p>
                             <div className="text-3xl font-mono text-blue-400">{interactionState.minigameData.target} MHz</div>
                           </div>
                           <p className="text-[10px] text-blue-500/70 text-center uppercase tracking-widest italic">The agent is searching. Tell them when they are hot.</p>
                         </div>
                       ) : (
                         <div className="w-full space-y-6">
                            <div className="h-16 bg-black border border-blue-500/30 flex items-center justify-center relative overflow-hidden">
                               <div className="text-2xl font-mono text-blue-500 z-10">{interactionState.minigameData.current} MHz</div>
                               <Activity className="absolute w-full h-full opacity-20 text-blue-500" />
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="1000" 
                              step="5"
                              value={interactionState.minigameData.current}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setInteractionState(prev => ({
                                  ...prev,
                                  minigameData: { ...prev.minigameData, current: val }
                                }));
                                if (Math.abs(val - interactionState.minigameData.target) < 10) {
                                   toast.success("SIGNAL LOCKED");
                                   completeMinigame();
                                }
                              }}
                              className="w-full accent-blue-500 h-2 bg-blue-900/30 rounded-lg appearance-none cursor-pointer"
                            />
                         </div>
                       )}
                     </div>
                   )}

                   {interactionState.entity.minigameType === "hex" && (
                     <div className="flex flex-col items-center gap-6">
                       <h4 className="text-gold font-bold uppercase tracking-[0.2em]">Hex Override Sequence</h4>
                       <div className="flex flex-col items-center gap-4">
                          {isIntel ? (
                            <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 text-center">
                               <p className="text-xs text-gold/70 mb-2 uppercase">Executive Suite Passcode</p>
                               <div className="text-4xl font-mono text-gold tracking-widest">{interactionState.minigameData.hex}</div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-center">
                               <p className="text-sm text-gold/60 italic">Input Hex sequence provided by Intel</p>
                               <input 
                                 type="text"
                                 placeholder="XX-XX-XX"
                                 className="bg-black border-b-2 border-gold p-4 text-2xl font-mono text-center text-gold focus:outline-none w-full"
                                 onChange={(e) => {
                                   if (e.target.value.toUpperCase() === interactionState.minigameData.hex) {
                                      toast.success("ENCRYPTION BROKEN");
                                      completeMinigame();
                                   }
                                 }}
                               />
                            </div>
                          )}
                       </div>
                     </div>
                   )}
                </div>

                <div className="flex justify-end mt-6 w-full">
                   <button onClick={closeInteraction} className="text-red-500 hover:text-red-400 text-xs uppercase underline">Abort Mission</button>
                </div>
              </div>
            )}

            {interactionState.phase === "terminal" && (
              <>
                <div className="flex items-center gap-3 border-b border-gold/30 pb-4 mb-4">
                  <Terminal className="w-6 h-6 text-gold" />
                  <h3 className="text-xl font-bold text-gold uppercase">
                    {interactionState.entity.name}
                  </h3>
                </div>

                <div className="bg-black border border-border h-64 overflow-y-auto p-4 mb-4 font-mono text-sm leading-relaxed text-green-500 flex flex-col">
                  {interactionState.terminalOutput.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                  <div ref={endOfTerminalRef}></div>
                </div>

                <form onSubmit={submitTerminal} className="flex gap-2">
                  <div className="flex-none text-green-500 flex items-center px-2 font-mono">
                    root@sys:/{interactionState.terminalPwd.join("/")}#
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={interactionState.terminalInput}
                    onChange={(e) =>
                      setInteractionState((prev) => ({
                        ...prev,
                        terminalInput: e.target.value,
                      }))
                    }
                    className="flex-1 bg-black border border-border p-2 text-green-500 font-mono focus:outline-none focus:border-green-500"
                  />
                  <button type="submit" className="hidden" />
                </form>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={closeInteraction}
                    className="text-muted hover:text-white uppercase"
                  >
                    Disconnect [ESC]
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
