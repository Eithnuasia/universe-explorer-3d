"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, Preload, useGLTF } from "@react-three/drei";
import { SolarSystem } from "./solar-system";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Loading } from "@/components/ui/loading";
import { FirstPersonController } from "./first-person-controller";
import { Crosshair } from "@/components/ui/crosshair";
import { SpaceshipHUD } from "@/components/ui/spaceship-hud";
import { Vector3 } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { InfoDialog } from "@/components/ui/info-dialog";
import { usePlanetInteraction } from "@/lib/hooks/use-planet-interaction";
import { planets } from "@/lib/constants/planets";
import * as THREE from "three";
import { RocketIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { UFO } from "./ufo";
import { Raycaster } from "three";

// Component to handle camera repositioning for tours
function CameraPositionHelper({ position }: { position: number[] | null }) {
  const { camera } = useThree();

  useEffect(() => {
    if (position && position.length === 3) {
      camera.position.set(position[0], position[1], position[2]);
      camera.lookAt(0, 0, 0); // Look at the center of the solar system
    }
  }, [camera, position]);

  return null;
}

function SpeedTracker({ setSpeed }: { setSpeed: (v: number) => void }) {
  const lastPosition = useRef<THREE.Vector3 | null>(null);
  useFrame(({ camera }, delta) => {
    if (!lastPosition.current) {
      lastPosition.current = camera.position.clone();
      setSpeed(0);
      return;
    }
    const dist = camera.position.distanceTo(lastPosition.current);
    const kmPerUnit = 1_500_000;
    const speedKmPerS = (dist / delta) * kmPerUnit;
    setSpeed(speedKmPerS);
    lastPosition.current.copy(camera.position);
  });
  return null;
}

function SpeedIndicator({ speed }: { speed: number }) {
  // Animasi smooth angka
  const [displaySpeed, setDisplaySpeed] = useState(0);
  useEffect(() => {
    const diff = speed - displaySpeed;
    if (Math.abs(diff) < 1) {
      setDisplaySpeed(speed);
      return;
    }
    const anim = setTimeout(() => {
      setDisplaySpeed(displaySpeed + diff * 0.2);
    }, 16);
    return () => clearTimeout(anim);
  }, [speed, displaySpeed]);

  return (
    <div className="absolute bottom-8 right-8 z-50 pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-black/30 backdrop-blur-sm border-b-2 border-cyan-400/60 rounded-sm shadow-sm font-mono">
        <RocketIcon size={18} className="text-cyan-400 opacity-80" />
        <span
          className={`text-cyan-400 font-mono text-xl transition-all duration-200 ${
            displaySpeed > 100_000 ? "drop-shadow-[0_0_6px_#22d3ee]" : ""
          }`}
          style={{
            minWidth: 60,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(displaySpeed)}
        </span>
        <span className="text-cyan-200 text-xs ml-1 font-mono">km/s</span>
      </div>
    </div>
  );
}

// Laser Component
function Laser({
  start,
  end,
  isActive,
  weaponMode,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  isActive: boolean;
  weaponMode: boolean;
}) {
  const points = useMemo(() => [start, end], [start, end]);
  const glowGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );
  const coreGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  // Flare di ujung laser
  const Flare = () => (
    <mesh position={end}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#ffcc88" transparent opacity={0.55} />
    </mesh>
  );

  return (
    <group visible={isActive}>
      {/* Glow */}
      <primitive
        object={
          new THREE.Line(
            glowGeometry,
            new THREE.LineBasicMaterial({
              color: weaponMode ? "#ff8800" : "#ff8800",
              linewidth: 12, // hanya efek visual, tidak semua renderer support
              transparent: true,
              opacity: 0.25,
            })
          )
        }
      />
      {/* Core */}
      <primitive
        object={
          new THREE.Line(
            coreGeometry,
            new THREE.LineBasicMaterial({
              color: weaponMode ? "#ff0000" : "#ff0000",
              linewidth: 3,
              transparent: true,
              opacity: 0.95,
            })
          )
        }
      />
      {/* Flare di ujung laser */}
      {isActive && <Flare />}
    </group>
  );
}

// Health Bar UFO di atas UFO (screen projection)
function UFOHealthBar({
  ufoRef,
  health,
  cameraRef,
}: {
  ufoRef: React.RefObject<THREE.Group>;
  health: number;
  cameraRef: React.RefObject<THREE.Camera>;
}) {
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: -9999,
    top: -9999,
  });
  const { size } = useThree();

  useEffect(() => {
    function updatePosition() {
      if (!ufoRef.current || !cameraRef.current) return;
      // Ambil posisi UFO di world
      const ufoWorldPos = new THREE.Vector3();
      ufoRef.current.getWorldPosition(ufoWorldPos);
      // Proyeksikan ke screen
      const projected = ufoWorldPos.clone().project(cameraRef.current);
      const left = ((projected.x + 1) / 2) * size.width;
      const top = ((-projected.y + 1) / 2) * size.height - 40; // offset ke atas
      setPos({ left, top });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [ufoRef, cameraRef, size.width, size.height]);

  // Update setiap frame
  useFrame(() => {
    if (!ufoRef.current || !cameraRef.current) return;
    const ufoWorldPos = new THREE.Vector3();
    ufoRef.current.getWorldPosition(ufoWorldPos);
    const projected = ufoWorldPos.clone().project(cameraRef.current);
    const left = ((projected.x + 1) / 2) * size.width;
    const top = ((-projected.y + 1) / 2) * size.height - 40;
    setPos({ left, top });
  });

  if (health <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        zIndex: 100,
      }}
    >
      <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-500/30">
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-300"
              style={{ width: `${health}%` }}
            />
          </div>
          <span className="text-red-400 font-mono text-sm">{health}%</span>
        </div>
      </div>
    </div>
  );
}

// Tambahkan AudioManager untuk movement sound dan ambient sound
function useGameAudio() {
  const movementSound = useRef<HTMLAudioElement | null>(null);
  const ambientSound = useRef<HTMLAudioElement | null>(null);
  const battleSound = useRef<HTMLAudioElement | null>(null);
  const clickSoundPool = useRef<HTMLAudioElement[]>([]);
  const currentClickIndex = useRef(0);
  const questCompletedSound = useRef<HTMLAudioElement | null>(null);
  const victorySound = useRef<HTMLAudioElement | null>(null);
  const warningSound = useRef<HTMLAudioElement | null>(null);
  const laserSound = useRef<HTMLAudioElement | null>(null);
  const typewriterSound = useRef<HTMLAudioElement | null>(null);
  const typewriterInterval = useRef<number | null>(null);
  const isMovementPlaying = useRef(false);
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    // Inisialisasi audio
    movementSound.current = new Audio("/sounds/ambient/movement.mp3");
    movementSound.current.loop = true;
    movementSound.current.volume = 0.5;

    // Inisialisasi ambient sound
    ambientSound.current = new Audio("/sounds/ambient/ambient.mp3");
    ambientSound.current.loop = true;
    ambientSound.current.volume = 0.25;

    // Inisialisasi battle sound
    battleSound.current = new Audio("/sounds/ambient/battle.mp3");
    battleSound.current.loop = true;
    battleSound.current.volume = 0.35;

    // Inisialisasi laser sound
    laserSound.current = new Audio("/sounds/weapons/laser.mp3");
    laserSound.current.volume = 0.45;
    laserSound.current.preload = "auto";
    laserSound.current.load();

    // Inisialisasi click sound pool
    for (let i = 0; i < 3; i++) {
      const clickSound = new Audio("/sounds/ui/click.mp3");
      clickSound.volume = 0.3;
      clickSound.preload = "auto";
      clickSound.load();
      clickSoundPool.current.push(clickSound);
    }

    // Inisialisasi quest completed sound
    questCompletedSound.current = new Audio("/sounds/ui/quest-completed.mp3");
    questCompletedSound.current.volume = 0.4;
    questCompletedSound.current.preload = "auto";
    questCompletedSound.current.load();

    // Inisialisasi victory sound
    victorySound.current = new Audio("/sounds/ui/succes.mp3");
    victorySound.current.volume = 0.4;
    victorySound.current.preload = "auto";
    victorySound.current.load();

    // Inisialisasi warning sound - versi sederhana tanpa efek
    warningSound.current = new Audio("/sounds/ui/warning.mp3");
    warningSound.current.volume = 0.6;
    warningSound.current.preload = "auto";
    warningSound.current.load();

    // Inisialisasi typewriter sound
    typewriterSound.current = new Audio("/sounds/ui/typewriter.wav");
    typewriterSound.current.volume = 0.2;
    typewriterSound.current.preload = "auto";
    typewriterSound.current.load();
    if (typewriterSound.current) {
      typewriterSound.current.loop = true;
    }

    // Function to start ambient sound
    const startAmbientSound = async () => {
      if (ambientSound.current && !hasUserInteracted.current) {
        try {
          await ambientSound.current.play();
          hasUserInteracted.current = true;
        } catch (error) {
          console.log("Autoplay prevented, waiting for user interaction");
        }
      }
    };

    // Try to start ambient sound
    startAmbientSound();

    // Add click listener to start sound on first user interaction
    const handleFirstInteraction = async () => {
      if (!hasUserInteracted.current) {
        await startAmbientSound();
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      }
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      if (movementSound.current) {
        movementSound.current.pause();
        movementSound.current = null;
      }
      if (ambientSound.current) {
        ambientSound.current.pause();
        ambientSound.current = null;
      }
      if (battleSound.current) {
        battleSound.current.pause();
        battleSound.current = null;
      }
      clickSoundPool.current.forEach((sound) => {
        sound.pause();
        sound.src = "";
      });
      clickSoundPool.current = [];
      if (questCompletedSound.current) {
        questCompletedSound.current.pause();
        questCompletedSound.current = null;
      }
      if (victorySound.current) {
        victorySound.current.pause();
        victorySound.current = null;
      }
      if (warningSound.current) {
        warningSound.current.pause();
        warningSound.current = null;
      }
      if (laserSound.current) {
        laserSound.current.pause();
        laserSound.current = null;
      }
      if (typewriterSound.current) {
        typewriterSound.current.pause();
        typewriterSound.current = null;
      }
      if (typewriterInterval.current) {
        clearInterval(typewriterInterval.current);
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const playMovementSound = useCallback(() => {
    if (movementSound.current && !isMovementPlaying.current) {
      // Langsung play dengan volume penuh, tanpa fade in
      movementSound.current.volume = 0.6;
      movementSound.current.play();
      isMovementPlaying.current = true;
    }
  }, []);

  const stopMovementSound = useCallback(() => {
    if (movementSound.current && isMovementPlaying.current) {
      // Langsung stop tanpa fade out
      movementSound.current.pause();
      movementSound.current.currentTime = 0;
      isMovementPlaying.current = false;
    }
  }, []);

  const setBoostSound = useCallback((isBoosting: boolean) => {
    if (movementSound.current) {
      movementSound.current.playbackRate = isBoosting ? 1.5 : 1.0;
      // Tambah pitch shift saat boost
      if (isBoosting) {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(
          movementSound.current
        );
        const pitchShift = audioContext.createBiquadFilter();
        pitchShift.type = "highshelf";
        pitchShift.frequency.value = 1000;
        pitchShift.gain.value = 3;
        source.connect(pitchShift);
        pitchShift.connect(audioContext.destination);
      }
    }
  }, []);

  const playClickSound = useCallback(() => {
    if (clickSoundPool.current.length > 0) {
      const sound = clickSoundPool.current[currentClickIndex.current];
      sound.currentTime = 0;
      sound.play().catch(() => {});

      // Rotate through the pool
      currentClickIndex.current =
        (currentClickIndex.current + 1) % clickSoundPool.current.length;
    }
  }, []);

  const playQuestCompletedSound = useCallback(() => {
    if (questCompletedSound.current) {
      questCompletedSound.current.currentTime = 0;
      questCompletedSound.current.play().catch(() => {});
    }
  }, []);

  const playVictorySound = useCallback(() => {
    if (victorySound.current) {
      victorySound.current.currentTime = 0;
      victorySound.current.play().catch(() => {});
    }
  }, []);

  const playWarningSound = useCallback(() => {
    console.log("Playing warning sound...");
    if (warningSound.current) {
      warningSound.current.currentTime = 0;
      warningSound.current.volume = 0.6;
      warningSound.current
        .play()
        .then(() => console.log("Warning sound played successfully"))
        .catch((error) => {
          console.error("Error playing warning sound:", error);
          // Coba inisialisasi ulang jika gagal
          warningSound.current = new Audio("/sounds/ui/warning.mp3");
          warningSound.current.volume = 0.6;
          warningSound.current.play().catch(console.error);
        });
    }
  }, []);

  const startBattleMusic = useCallback(async () => {
    if (ambientSound.current) {
      // Fade out ambient sound lebih cepat
      const fadeOutInterval = setInterval(() => {
        if (ambientSound.current && ambientSound.current.volume > 0) {
          ambientSound.current.volume = Math.max(
            0,
            ambientSound.current.volume - 0.02
          );
        } else {
          clearInterval(fadeOutInterval);
          if (ambientSound.current) {
            ambientSound.current.pause();
            ambientSound.current.volume = 0.15;
          }
        }
      }, 25); // Lebih cepat

      // Start battle music with fade in
      if (battleSound.current) {
        battleSound.current.currentTime = 0;
        battleSound.current.volume = 0;
        await battleSound.current.play().catch(() => {});

        const fadeInInterval = setInterval(() => {
          if (battleSound.current && battleSound.current.volume < 0.35) {
            battleSound.current.volume = Math.min(
              0.35,
              battleSound.current.volume + 0.02
            );
          } else {
            clearInterval(fadeInInterval);
          }
        }, 25); // Lebih cepat
      }
    }
  }, []);

  const stopBattleMusic = useCallback(async () => {
    if (battleSound.current) {
      // Fade out battle sound
      const fadeOutInterval = setInterval(() => {
        if (battleSound.current && battleSound.current.volume > 0) {
          battleSound.current.volume = Math.max(
            0,
            battleSound.current.volume - 0.01
          );
        } else {
          clearInterval(fadeOutInterval);
          if (battleSound.current) {
            battleSound.current.pause();
            battleSound.current.volume = 0.35; // Reset volume untuk next time
          }
        }
      }, 50);

      // Resume ambient music with fade in
      if (ambientSound.current) {
        ambientSound.current.currentTime = 0;
        ambientSound.current.volume = 0;
        await ambientSound.current.play().catch(() => {});

        const fadeInInterval = setInterval(() => {
          if (ambientSound.current && ambientSound.current.volume < 0.15) {
            ambientSound.current.volume = Math.min(
              0.15,
              ambientSound.current.volume + 0.01
            );
          } else {
            clearInterval(fadeInInterval);
          }
        }, 50);
      }
    }
  }, []);

  const playLaserSound = useCallback(() => {
    if (laserSound.current) {
      // Reset dan play ulang
      laserSound.current.currentTime = 0;
      laserSound.current.volume = 0.6;
      laserSound.current.play().catch((error) => {
        console.error("Error playing laser sound:", error);
        // Coba inisialisasi ulang jika gagal
        laserSound.current = new Audio("/sounds/weapons/laser.mp3");
        laserSound.current.volume = 0.6;
        laserSound.current.play().catch(console.error);
      });
    }
  }, []);

  const startTypewriterSound = useCallback(() => {
    if (typewriterSound.current) {
      typewriterSound.current.currentTime = 0;
      typewriterSound.current.play().catch(() => {});
    }
  }, []);

  const stopTypewriterSound = useCallback(() => {
    if (typewriterSound.current) {
      typewriterSound.current.pause();
      typewriterSound.current.currentTime = 0;
    }
  }, []);

  return {
    playMovementSound,
    stopMovementSound,
    setBoostSound,
    playClickSound,
    playQuestCompletedSound,
    playVictorySound,
    playWarningSound,
    startBattleMusic,
    stopBattleMusic,
    playLaserSound,
    startTypewriterSound,
    stopTypewriterSound,
  };
}

// Custom hook untuk menggunakan click sound
function useClickSound() {
  const { playClickSound } = useGameAudio();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      playClickSound();
    },
    [playClickSound]
  );

  return handleClick;
}

interface UniverseSceneProps {
  initialCameraPosition?: number[] | null;
}

export function UniverseScene({ initialCameraPosition }: UniverseSceneProps) {
  const { selectedPlanet, showDialog, textCompleted, handleTextComplete } =
    usePlanetInteraction();

  const selectedPlanetData = planets.find(
    (planet) => planet.name === selectedPlanet
  );

  // State discovered
  const [discoveredPlanets, setDiscoveredPlanets] = useState<string[]>([]);
  // Dialog state
  const [selectedObject, setSelectedObject] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textDone, setTextDone] = useState(false);
  const typingRef = useRef<number | null>(null);
  // Speed indicator state
  const [speed, setSpeed] = useState(0);
  // Quest completion popup state
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [ufoActive, setUfoActive] = useState(false);
  const [weaponMode, setWeaponMode] = useState(false);
  const [ufoMaxHealth] = useState(400); // fix max health sesuai permintaan
  const [ufoHealth, setUfoHealth] = useState(400); // default sama dengan max health
  const [showLaser, setShowLaser] = useState(false);
  const [laserStart, setLaserStart] = useState(new THREE.Vector3());
  const [laserEnd, setLaserEnd] = useState(new THREE.Vector3());
  const cameraRef = useRef<THREE.Camera>();
  const ufoGroupRef = useRef<THREE.Group>(null);
  const [ufoScreenPos, setUfoScreenPos] = useState<{
    left: number;
    top: number;
  }>({ left: -9999, top: -9999 });
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [exploreOnlyMode, setExploreOnlyMode] = useState(false); // mode hanya menjelajah setelah victory
  const pointerLockRef = useRef<any>(null);
  const {
    playMovementSound,
    stopMovementSound,
    setBoostSound,
    playClickSound,
    playQuestCompletedSound,
    playVictorySound,
    playWarningSound,
    startBattleMusic,
    stopBattleMusic,
    playLaserSound,
    startTypewriterSound,
    stopTypewriterSound,
  } = useGameAudio();
  const handleClickSound = useClickSound();
  const isMoving = useRef(false);
  const isBoosting = useRef(false);

  // Daftar semua benda langit yang bisa dipelajari
  const questObjects = [
    "Sun",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Moon",
  ];

  // Toggle weapon mode dengan F (saat warning aktif)
  useEffect(() => {
    const handleWeaponToggle = (e: KeyboardEvent) => {
      if (e.code === "KeyF" && showWarning) {
        setWeaponMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleWeaponToggle);
    return () => window.removeEventListener("keydown", handleWeaponToggle);
  }, [showWarning]);

  // Handler klik planet/benda langit
  function handleObjectClick(name: string, description: string) {
    playClickSound();
    if (weaponMode) return; // Disable interaksi saat mode senjata
    if (exploreOnlyMode) {
      // Mode penjelajahan: hanya tampilkan deskripsi, tidak ada quest/warning
      setSelectedObject({ name, description });
      setDialogOpen(true);
      setDisplayedText("");
      setTextDone(false);
      return;
    }
    setDiscoveredPlanets((prev) =>
      prev.includes(name) ? prev : [...prev, name]
    );
    setSelectedObject({ name, description });
    setDialogOpen(true);
    setDisplayedText("");
    setTextDone(false);
  }

  // Typewriter effect
  useEffect(() => {
    if (dialogOpen && selectedObject) {
      setDisplayedText("");
      setTextDone(false);
      let i = 0;

      // Mulai suara typewriter
      startTypewriterSound();

      const type = () => {
        if (!selectedObject) return;
        setDisplayedText(selectedObject.description.slice(0, i));
        if (i < selectedObject.description.length) {
          i++;
          typingRef.current = window.setTimeout(type, 10);
        } else {
          setDisplayedText(selectedObject.description);
          setTextDone(true);
          // Hentikan suara typewriter saat selesai
          stopTypewriterSound();
        }
      };
      type();
      return () => {
        if (typingRef.current) clearTimeout(typingRef.current);
        stopTypewriterSound();
      };
    }
  }, [dialogOpen, selectedObject, startTypewriterSound, stopTypewriterSound]);

  // Handle space to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (dialogOpen && textDone && e.code === "Space") {
        setDialogOpen(false);
        setSelectedObject(null);
        setDisplayedText("");
        setTextDone(false);
        // Check if ini planet terakhir dan bukan di mode jelajah
        if (
          discoveredPlanets.length === questObjects.length &&
          !exploreOnlyMode
        ) {
          setShowQuestPopup(true);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dialogOpen, textDone, discoveredPlanets, exploreOnlyMode]);

  // Handle quest completion and trigger warning
  useEffect(() => {
    if (showQuestPopup && !exploreOnlyMode) {
      console.log("Quest popup shown, preparing warning...");
      playQuestCompletedSound();

      // Show warning after 5 seconds
      const warningTimer = setTimeout(() => {
        console.log("Showing UFO warning...");
        setShowWarning(true);
        setUfoActive(true);
        setUfoHealth(400);
        setShowQuestPopup(false);

        // Play warning sound immediately
        playWarningSound();

        // Start battle music after warning
        startBattleMusic();
      }, 5000);

      return () => clearTimeout(warningTimer);
    }
  }, [
    showQuestPopup,
    playQuestCompletedSound,
    playWarningSound,
    startBattleMusic,
    exploreOnlyMode,
  ]);

  // Handle weapon activation & raycast
  useEffect(() => {
    // Klik kiri mouse untuk menembak saat weaponMode aktif
    const handleShoot = (e: MouseEvent) => {
      if (
        !weaponMode ||
        !ufoActive ||
        !ufoGroupRef.current ||
        !cameraRef.current
      )
        return;

      // Play laser sound
      playLaserSound();

      // Raycast dari kamera ke depan
      const raycaster = new Raycaster();
      const camera = cameraRef.current;
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      raycaster.set(camera.position, direction);

      // Cek intersect dengan UFO
      const intersects = raycaster.intersectObject(ufoGroupRef.current, true);
      if (intersects.length > 0) {
        handleUFOHit();
        setLaserEnd(intersects[0].point.clone());
      } else {
        setLaserEnd(camera.position.clone().add(direction.multiplyScalar(100)));
      }
      setLaserStart(camera.position.clone());

      // Reset showLaser agar selalu muncul walau klik cepat
      setShowLaser(false);
      setTimeout(() => {
        setShowLaser(true);
        setTimeout(() => {
          setShowLaser(false);
        }, 250);
      }, 10);
    };

    if (weaponMode) {
      window.addEventListener("mousedown", handleShoot);
    }
    return () => {
      window.removeEventListener("mousedown", handleShoot);
    };
  }, [weaponMode, ufoActive, playLaserSound]);

  const handleUFOHit = () => {
    setUfoHealth((prev) => {
      const newHealth = prev - 20;
      if (newHealth <= 0) {
        setUfoActive(false);
        setShowWarning(false);
      }
      return newHealth;
    });
  };

  // Otomatis keluar dari weaponMode setelah UFO dikalahkan
  useEffect(() => {
    if (!ufoActive && weaponMode) {
      setWeaponMode(false);
    }
  }, [ufoActive, weaponMode]);

  // Tampilkan popup kemenangan setelah UFO dikalahkan
  useEffect(() => {
    if (ufoActive === false && ufoHealth <= 0) {
      setShowVictoryPopup(true);
      playVictorySound(); // Play victory sound
      stopBattleMusic(); // Stop battle music and resume ambient
      // Unlock pointer saat popup muncul
      if (pointerLockRef.current) {
        pointerLockRef.current.unlock();
      }
    }
  }, [ufoActive, ufoHealth, playVictorySound, stopBattleMusic]);

  // Prevent pointer lock while victory popup is active
  useEffect(() => {
    if (showVictoryPopup && pointerLockRef.current) {
      const preventPointerLock = () => {
        if (pointerLockRef.current) {
          pointerLockRef.current.unlock();
        }
      };

      // Prevent pointer lock on click
      document.addEventListener("click", preventPointerLock);

      return () => {
        document.removeEventListener("click", preventPointerLock);
      };
    }
  }, [showVictoryPopup]);

  // Modifikasi FirstPersonController untuk menambahkan onMovementChange
  const handleMovementChange = useCallback(
    (moving: boolean, boosting: boolean) => {
      isMoving.current = moving;
      isBoosting.current = boosting;

      if (moving) {
        playMovementSound();
      } else {
        stopMovementSound();
      }

      setBoostSound(boosting);
    },
    [playMovementSound, stopMovementSound, setBoostSound]
  );

  return (
    <div
      className={`w-full h-screen bg-black relative ${
        weaponMode ? "weapon-mode" : ""
      }`}
    >
      <Canvas
        camera={{
          position: [0, 20, 100],
          fov: 60,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ position: "absolute" }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <SpeedTracker setSpeed={setSpeed} />
        <Suspense fallback={<Loading />}>
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 0, 0]} intensity={3} />
          <directionalLight
            position={[50, 30, 50]}
            intensity={1.2}
            color="#ffffff"
          />
          <Stars
            radius={150}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* First person flight controller */}
          <FirstPersonController
            ref={pointerLockRef}
            onMovementChange={handleMovementChange}
          />

          {/* Camera helper for tour positioning */}
          {initialCameraPosition && (
            <CameraPositionHelper position={initialCameraPosition} />
          )}

          {/* Pass discoveredPlanets to SolarSystem */}
          <SolarSystem
            onObjectClick={handleObjectClick}
            discoveredPlanets={discoveredPlanets}
          />
          <Preload all />
        </Suspense>

        {/* Add UFO to the scene - hanya tampilkan jika bukan exploreOnlyMode */}
        {!exploreOnlyMode && (
          <UFO
            isActive={ufoActive}
            onHit={handleUFOHit}
            onHealthChange={setUfoHealth}
            ufoRef={ufoGroupRef}
            camera={cameraRef.current!}
            onScreenPositionChange={setUfoScreenPos}
          />
        )}

        {/* Laser dengan efek visual (glow/blur) */}
        <Laser
          start={laserStart}
          end={laserEnd}
          isActive={showLaser}
          weaponMode={weaponMode}
        />
      </Canvas>

      {/* Health Bar UFO statis di bawah layar - hanya tampilkan jika bukan exploreOnlyMode */}
      {ufoActive && !exploreOnlyMode && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-40 w-full flex justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-red-500/70 shadow-lg w-[480px] max-w-full flex flex-col items-center">
            <div className="text-red-400 font-mono text-xl font-bold mb-2 drop-shadow">
              UFO
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden border border-red-500/60">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-yellow-300 transition-all duration-300 shadow-lg"
                  style={{
                    width: `${Math.max(0, (ufoHealth / ufoMaxHealth) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-red-400 font-mono text-lg font-bold drop-shadow ml-4">
                {Math.max(0, ufoHealth)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quest completion popup */}
      <AnimatePresence>
        {!exploreOnlyMode && showQuestPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-start justify-center z-50 pt-6"
          >
            <div className="relative w-full max-w-md mx-4">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl" />

              {/* Main popup container */}
              <div className="relative bg-black/80 backdrop-blur-md border border-cyan-500/30 px-10 py-8 rounded-2xl shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />

                {/* Content */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-4xl mb-2"
                    >
                      🎉
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-cyan-400 mb-2 font-mono tracking-wider"
                    >
                      Selamat!
                    </motion.h2>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/90 font-mono"
                  >
                    Kamu Telah Menyelesaikan Quest
                  </motion.p>

                  {/* Progress indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full mt-4"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning popup - hanya tampilkan jika bukan exploreOnlyMode */}
      <AnimatePresence>
        {showWarning && !exploreOnlyMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-start justify-center z-50 pt-6"
          >
            <div className="relative w-full max-w-md mx-4">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-2xl" />

              {/* Main popup container */}
              <div className="relative bg-black/80 backdrop-blur-md border border-red-500/30 px-10 py-8 rounded-2xl shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />

                {/* Content */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-4xl mb-2"
                    >
                      ⚠️
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-red-400 mb-2 font-mono tracking-wider"
                    >
                      Peringatan!
                    </motion.h2>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/90 font-mono"
                  >
                    UFO Terdeteksi!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-white/70 font-mono"
                  >
                    Tekan F untuk mengaktifkan senjata
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory popup setelah mengalahkan UFO, fullscreen, 2 opsi, cursor pointer */}
      <AnimatePresence>
        {showVictoryPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[999] bg-black/80 backdrop-blur-md cursor-default"
            style={{ pointerEvents: "auto", cursor: "default" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-2xl mx-4">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-2xl" />

              {/* Main popup container */}
              <div className="relative bg-black/80 backdrop-blur-md border border-yellow-400/30 px-10 py-8 rounded-2xl shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />

                {/* Content */}
                <div className="text-center space-y-6">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-4xl mb-2"
                    >
                      🏆
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-yellow-400 mb-2 font-mono tracking-wider"
                    >
                      Selamat!
                    </motion.h2>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/90 font-mono"
                  >
                    Selamat! Kamu telah menyelamatkan alam semesta!
                  </motion.p>

                  {/* Progress indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full mt-4"
                  />

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                    <button
                      className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold text-base shadow-lg hover:bg-yellow-300 transition-all border border-yellow-500 font-mono"
                      style={{ minWidth: 200, cursor: "pointer" }}
                      onClick={(e) => {
                        handleClickSound(e);
                        setShowVictoryPopup(false);
                        setExploreOnlyMode(true);
                        setUfoActive(false);
                        setShowWarning(false);
                      }}
                    >
                      Lanjutkan Penjelajahan
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg bg-black text-yellow-400 font-bold text-base shadow-lg hover:bg-yellow-900 transition-all border border-yellow-500 font-mono"
                      style={{ minWidth: 200, cursor: "pointer" }}
                      onClick={(e) => {
                        handleClickSound(e);
                        window.location.reload();
                      }}
                    >
                      Ulangi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Layer - All UI components go here */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Quest List di pojok kanan atas - hanya tampilkan jika bukan exploreOnlyMode */}
        {!exploreOnlyMode && (
          <div className="absolute top-6 right-6 z-50 flex flex-col items-end pointer-events-auto font-mono">
            <div
              className="bg-black/70 rounded-lg px-4 py-2 shadow text-cyan-300 text-xs font-mono"
              style={{ minWidth: 180, boxShadow: "0 2px 8px #000" }}
            >
              <div
                className="font-bold text-cyan-400 mb-1 font-mono"
                style={{ fontSize: 13 }}
              >
                Quest: Pelajari Benda Langit
              </div>
              {questObjects.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 font-mono"
                  style={{ marginBottom: 2 }}
                >
                  <span className="font-mono" style={{ fontSize: 15 }}>
                    {discoveredPlanets.includes(name) ? "✔️" : "⬜"}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      color: discoveredPlanets.includes(name) ? "#fff" : "#aaa",
                      fontWeight: discoveredPlanets.includes(name) ? 600 : 400,
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Minimalist controls guide */}
        <div className="absolute top-6 left-6 flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="text-cyan-400 text-xs font-mono">W|S|A|D</div>
            <div className="text-white/60 text-xs">Move</div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="text-cyan-400 text-xs font-mono">Q|E</div>
            <div className="text-white/60 text-xs">Up/Down</div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="text-cyan-400 text-xs font-mono">Mouse</div>
            <div className="text-white/60 text-xs">Look</div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="text-cyan-400 text-xs font-mono">Shift</div>
            <div className="text-white/60 text-xs">Boost</div>
          </div>
        </div>

        {/* Crosshair - berubah warna saat weaponMode */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className={`w-8 h-8 border-2 rounded-full flex items-center justify-center ${
              weaponMode ? "border-red-500" : "border-cyan-400"
            }`}
            style={{
              boxShadow: weaponMode ? "0 0 12px #f00" : "0 0 8px #22d3ee",
            }}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                weaponMode ? "bg-red-500" : "bg-cyan-400"
              }`}
            ></div>
          </div>
        </div>

        {/* Spaceship HUD */}
        <SpaceshipHUD />

        {/* Speed Indicator di pojok kanan atas (modern, smooth, konsisten UI) */}
        <SpeedIndicator speed={speed} />

        {/* Dialog deskripsi planet/benda langit */}
        {dialogOpen && selectedObject && (
          <div
            className="fixed left-1/2 z-50 pointer-events-auto font-mono"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              width: "90vw",
              height: "33vh",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
          >
            <div
              className="font-mono"
              style={{
                background: "rgba(37, 36, 39, 0.34)",
                borderRadius: 18,
                padding: 24,
                width: "100%",
                height: "100%",
                maxWidth: 1200,
                boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Judul selalu di atas */}
              <div
                className="font-mono"
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#fff",
                  lineHeight: 1.1,
                  marginBottom: 0,
                  textShadow: "0 2px 8px #000, 0 1px 0 #222",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  position: "absolute",
                  top: 18,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                }}
              >
                {selectedObject.name}
              </div>
              {/* Spacer agar deskripsi tidak menabrak judul */}
              <div style={{ height: 48 }} />
              <div
                className="font-mono"
                style={{
                  fontSize: 16,
                  color: "#fff",
                  fontWeight: "normal",
                  lineHeight: 1.5,
                  minHeight: 40,
                  maxHeight: "calc(33vh - 80px)",
                  overflow: "auto",
                  marginBottom: 8,
                  letterSpacing: 0.1,
                  textShadow: "0 1px 4px #000",
                  transition: "color 0.2s",
                  padding: "0 12px",
                }}
              >
                {displayedText}
              </div>
              {textDone && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: 14,
                    color: "#00bcd4",
                    marginTop: 6,
                    fontWeight: 500,
                    letterSpacing: 0.5,
                    textShadow: "0 1px 4px #000",
                  }}
                >
                  Tekan SPASI untuk menutup
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
