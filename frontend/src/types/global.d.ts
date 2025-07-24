// Add global type declarations to make TypeScript happy
interface Window {
  resetSquatCounter?: () => void;
  workout_set_complete?: CustomEvent;
} 