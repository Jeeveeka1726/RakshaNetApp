// components/FallDetection.tsx
import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";
import { Alert } from "react-native";

const THRESHOLD = 2.5;

export default function FallDetection() {
  const triggeredRef = useRef(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > THRESHOLD && !triggeredRef.current) {
        triggeredRef.current = true;
        onFallDetected();

        setTimeout(() => {
          triggeredRef.current = false;
        }, 2000);
      }
    });

    return () => subscription.remove();
  }, []);

  const onFallDetected = () => {
    Alert.alert("🚨 Alert", "Sudden motion detected! Possible fall or snatch.");
    // You can add Vibration, API call, etc. here
  };

  return null;
}
