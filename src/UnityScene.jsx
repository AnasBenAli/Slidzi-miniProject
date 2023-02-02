import React, { useState, useCallback } from "react";
import { Unity, useUnityContext} from "react-unity-webgl";

export default function UnityScene() {
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "AR/Build/AR.loader.js",
    dataUrl: "AR/Build/AR.data",
    frameworkUrl: "AR/Build/AR.framework.js",
    codeUrl: "AR/Build/AR.wasm",
    streamingAssetsUrl: "AR/StreamingAssets",
    companyName: "DefaultCompany",
    productName: "SlidzoAR",
    productVersion: "0.1",
  });
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    window.devicePixelRatio
  );
  function DoubleScale(){
    sendMessage("Logo", "DoubleScale");
  }
  function HalfScale(){
    sendMessage("Logo", "HalfScale");
  }

  const handleChangePixelRatio = useCallback(
    function () {
      // A function which will update the device pixel ratio of the Unity
      // Application to match the device pixel ratio of the browser.
      const updateDevicePixelRatio = function () {
        setDevicePixelRatio(window.devicePixelRatio);
      };
      // A media matcher which watches for changes in the device pixel ratio.
      const mediaMatcher = window.matchMedia(
        `screen and (resolution: ${devicePixelRatio}dppx)`
      );
      // Adding an event listener to the media matcher which will update the
      // device pixel ratio of the Unity Application when the device pixel
      // ratio changes.
      mediaMatcher.addEventListener("change", updateDevicePixelRatio);
      return function () {
        // Removing the event listener when the component unmounts.
        mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
      };
    },
    [devicePixelRatio]
  );
  
  const loadingPercentage = Math.round(loadingProgression * 100);

  return (
    <div className="container">
      {isLoaded === false && (
        // We'll conditionally render the loading overlay if the Unity
        // Application is not loaded.
        <div className="loading-overlay">
          <p>Loading... ({loadingPercentage}%)</p>
        </div>
      )}
      <Unity
        className="unity"
        style={{ width: 400, height: 300 }}
        devicePixelRatio={devicePixelRatio}
        unityProvider={unityProvider}
      />
      <button
        onClick={() => {
          DoubleScale();
        }}
      >
        Double Scale !
      </button>
      <button
        onClick={() => {
          HalfScale();
        }}
      >
        Half Scale !
      </button>
    </div>
  );
}
