import { create } from 'zustand';
interface AlertsConfigState {
  alertsEnabled: boolean;
  setAlertsEnabled: (value: boolean) => void;
}
const useAlertsConfigStore = create<AlertsConfigState>((set) => ({
  alertsEnabled: false,
  setAlertsEnabled: (value: boolean) => set({ alertsEnabled: value }),
}));
export default useAlertsConfigStore;