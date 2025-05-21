import { createSignal, onMount } from "solid-js";
import "./App.css";

function App() {
  const [beta, setBeta] = createSignal(0);
  const [gamma, setGamma] = createSignal(0);
  const [granted, setGranted] = createSignal(false);

  onMount(() => {
    async function enableMotion() {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        // @ts-ignore
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          // @ts-ignore
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            setGranted(true);
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } catch (e) {
          console.error("Permission denied", e);
        }
      } else {
        setGranted(true);
        window.addEventListener("deviceorientation", handleOrientation);
      }
    }

    enableMotion();
  });

  function handleOrientation(event: DeviceOrientationEvent) {
    setBeta(event.beta || 0);
    setGamma(event.gamma || 0);
  }

  return (
    <div class="container">
      <div
        class="beer"
        style={{
          transform: `rotateX(${-beta()}deg) rotateY(${gamma()}deg)`,
        }}
      />
      {!granted() && (
        <div class="overlay">
          <p>Tap to enable motion</p>
        </div>
      )}
    </div>
  );
}

export default App;
