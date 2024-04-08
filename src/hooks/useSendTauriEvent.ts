import { emit } from "@tauri-apps/api/event";

type SendTauriEvent<T> = {
  emit: (data: T) => void;
};

export default function useSendTauriEvent<T>(eventName: string): SendTauriEvent<T> {
  return {
    emit: (data) => {
      emit(eventName, data);
    },
  };
}
