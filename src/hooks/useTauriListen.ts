import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

/**
 * Custom hook that listens for a specific event using Tauri and executes a callback function when the event is triggered.
 * Automatically unregisters the event listener when the component is unmounted.
 * @template T - The type of data payload expected from the event.
 * @param {string} event - The name of the event to listen for.
 * @param {(data: T) => void} callback - The callback function to execute when the event is triggered.
 */
export default function useTauriListen<T>(event: string, callback: (data: T) => void) {
  useEffect(() => {
    let unlisten: Awaited<ReturnType<typeof listen>> | undefined;
    (async () => {
      unlisten = await listen<T>(event, (data) => {
        callback(data.payload);
      });
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
}
