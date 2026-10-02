export interface Item {
  id: string;
  text: string;
  category: string;
  weight?: number; // Weight/odds (default 1)
}

export interface Batch {
  id: string;
  name: string;
  items: Item[];
  drawnIds: string[];
  createdAt: number;
}

export interface DrawLogEntry {
  id: string;
  itemId: string;
  itemText: string;
  category: string;
  batchId: string;
  batchName: string;
  drawnAt: number; // Unix timestamp in ms
}

export interface AppSettings {
  duration: number; // in seconds, default 5
  soundEnabled: boolean;
  confettiEnabled: boolean; // Confetti toggle
  containerBgColor: string; // customizable shuffle container background
  containerTextColor: string; // customizable shuffle container text color
  fontFamily: string; // selected default font family
  randomizeFontOnShuffle: boolean; // dynamically randomize font on each shuffle step/word
  allowRepeatWinners: boolean; // if false, drawn items cannot be picked again
  selectedCategory: string; // 'ALL' or specific category name
  activeBatchId: string; // currently active batch ID
}

export type RandomizerState = 'idle' | 'shuffling' | 'revealed';

export interface ShuffleRunData {
  winner: Item;
  sequence: Item[];
  totalSteps: number;
  duration: number; // in ms
}
