import { createSignal, onCleanup, Show } from "solid-js";

function App() {
  const [_, setBeta] = createSignal(0); // beta is available if you want to use it later
  const [gamma, setGamma] = createSignal(0);
  const [permissionGranted, setPermissionGranted] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  function handleOrientation(event: DeviceOrientationEvent) {
    setBeta(event.beta || 0);
    setGamma(event.gamma || 0);
  }

  async function requestAndEnableMotion() {
    setErrorMessage("");
    if (typeof DeviceOrientationEvent === "undefined") {
      const message =
        "Device Orientation API not supported on this browser/device.";
      console.error(message);
      setErrorMessage(message);
      return;
    }

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
      setPermissionGranted(true);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }

  onCleanup(() => {
    window.removeEventListener("deviceorientation", handleOrientation);
  });

  const beerRotation = () => -gamma();

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
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
            <h1>iBeer clone by 1sevarcher 🍻</h1>
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
        <div
          style={{
            position: "absolute",
            top: "30vh", // Surface of the beer starts 30% from the top of the screen
            left: "50%",
            width: "300vw", // Increased width
            height: "300vh", // Increased height, extends far below screen bottom
            background: "gold",
            "border-top": "25px solid rgba(255, 255, 255, 0.75)", // Foam
            "transform-origin": "50% 0%", // Rotate around the top-center of the element
            transform: `translateX(-50%) rotateZ(${beerRotation()}deg)`,
            transition: "transform 0.03s linear", // Faster transition for more responsiveness
          }}
        />
      </Show>
    </div>
  );
}

export default App;
