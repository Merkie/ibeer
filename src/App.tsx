import { createSignal, onCleanup, Show } from "solid-js";

function App() {
  const [_, setBeta] = createSignal(0);
  const [gamma, setGamma] = createSignal(0);
  const [permissionGranted, setPermissionGranted] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  // Function to handle device orientation events
  function handleOrientation(event: DeviceOrientationEvent) {
    setBeta(event.beta || 0); // Front-back tilt
    setGamma(event.gamma || 0); // Left-right tilt
  }

  // Function to request permission and start listening to orientation events
  async function requestAndEnableMotion() {
    setErrorMessage(""); // Clear previous errors
    // Check if the API is available
    if (typeof DeviceOrientationEvent === "undefined") {
      const message =
        "Device Orientation API not supported on this browser/device.";
      console.error(message);
      setErrorMessage(message);
      return;
    }

    // For iOS 13+ devices, permission needs to be requested
    // @ts-ignore: requestPermission is a non-standard extension
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        // @ts-ignore: requestPermission is a non-standard extension
        const permissionState = await (
          DeviceOrientationEvent as unknown as any
        ).requestPermission();
        if (permissionState === "granted") {
          setPermissionGranted(true);
          window.addEventListener("deviceorientation", handleOrientation);
        } else {
          const message = "Permission for device orientation was not granted.";
          console.error(message);
          setErrorMessage(message);
        }
      } catch (error: any) {
        console.error("Error requesting device orientation permission:", error);
        setErrorMessage(`Error requesting permission: ${error.message}`);
      }
    } else {
      // For non-iOS 13+ devices or browsers that don't require explicit permission
      // or where the permission API is not implemented in this way.
      setPermissionGranted(true);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }

  // Clean up the event listener when the component is unmounted
  onCleanup(() => {
    window.removeEventListener("deviceorientation", handleOrientation);
  });

  // Calculate the rotation for the beer based on gamma
  // We use -gamma because tilting the phone right (positive gamma)
  // should make the liquid appear to tilt left relative to the phone.
  const beerRotation = () => -gamma();

  // Optional: Adjust beer "level" based on beta (front/back tilt)
  // This is a simple example; you might want more complex logic.
  // const initialBeerHeightVh = 50;
  // const beerHeight = () => {
  //   let height = initialBeerHeightVh - (beta() / 4); // Adjust sensitivity with division factor
  //   return Math.max(5, Math.min(95, height)); // Clamp between 5vh and 95vh
  // };

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "black", // Overall background
        overflow: "hidden", // Crucial: clips the beer when it rotates
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
      }}
    >
      <Show
        when={permissionGranted()}
        fallback={
          <div
            style={{ "text-align": "center", color: "white", padding: "20px" }}
          >
            <h1>iBeer Time! 🍻</h1>
            <p style={{ margin: "20px 0" }}>
              Tap the button below to enable motion sensors and pour your
              virtual beer.
            </p>
            <button
              onClick={requestAndEnableMotion}
              style={{
                padding: "15px 30px",
                "font-size": "18px",
                cursor: "pointer",
                background: "gold",
                color: "black",
                border: "2px solid darkorange",
                "border-radius": "10px",
                "font-weight": "bold",
              }}
            >
              Enable Motion & Pour
            </button>
            <Show when={errorMessage()}>
              <p style={{ color: "red", "margin-top": "15px" }}>
                {errorMessage()}
              </p>
            </Show>
          </div>
        }
      >
        {/* The Beer Element */}
        <div
          style={{
            position: "absolute",
            bottom: "0", // Anchored to the bottom of the "glass" (screen)
            left: "50%", // Start at horizontal center
            width: "220vw", // Extra wide to prevent showing edges when tilted
            height: "60vh", // Initial "fill" level of the beer (adjust as desired)
            // height: `${beerHeight()}vh`, // For dynamic height with beta
            background: "gold",
            "border-top": "15px solid rgba(255, 255, 255, 0.7)", // Simple "foam"
            // Transform origin is key: rotate around the center of its bottom edge.
            "transform-origin": "50% 100%",
            // Apply translateX to truly center, then rotate.
            transform: `translateX(-50%) rotateZ(${beerRotation()}deg)`,
            // Smooth out the tilting motion
            transition: "transform 0.05s linear",
          }}
        />
        {/* Optional: Display beta/gamma values for debugging */}
        {/*
        <div style={{ position: "absolute", top: "10px", left: "10px", color: "white", "background-color": "rgba(0,0,0,0.5)", padding: "5px" }}>
          Beta (front/back): {beta().toFixed(2)}°<br />
          Gamma (left/right): {gamma().toFixed(2)}°<br />
          Rotation: {beerRotation().toFixed(2)}°
        </div>
        */}
      </Show>
    </div>
  );
}

export default App;
