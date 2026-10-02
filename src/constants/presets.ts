import { AppSettings, Item } from '../types';

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern Clean)', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  { id: 'Space Grotesk', label: 'Space Grotesk (Tech Modern)', fontFamily: "'Space Grotesk', sans-serif" },
  { id: 'Playfair Display', label: 'Playfair Display (Elegant Serif)', fontFamily: "'Playfair Display', serif" },
  { id: 'Bebas Neue', label: 'Bebas Neue (Bold Display)', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'Fredoka', label: 'Fredoka (Soft & Rounded)', fontFamily: "'Fredoka', sans-serif" },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Code Monospace)', fontFamily: "'JetBrains Mono', monospace" },
  { id: 'Syne', label: 'Syne (Geometric Expressive)', fontFamily: "'Syne', sans-serif" },
  { id: 'Caveat', label: 'Caveat (Casual Handwriting)', fontFamily: "'Caveat', cursive" },
];

export const CONTAINER_COLOR_PRESETS = [
  { name: 'Pure White', bg: '#ffffff', text: '#0f172a' },
  { name: 'Soft Dark', bg: '#0f172a', text: '#ffffff' },
  { name: 'Cream Warm', bg: '#fefce8', text: '#713f12' },
  { name: 'Mint Fresh', bg: '#f0fdf4', text: '#14532d' },
  { name: 'Sky Calm', bg: '#f0f9ff', text: '#0c4a6e' },
  { name: 'Lavender', bg: '#faf5ff', text: '#581c87' },
];

export const DEFAULT_ITEMS: Item[] = [
  { id: '1', text: 'iPhone 16 Pro Max', category: 'Gadgets', weight: 1 },
  { id: '2', text: 'Sony PlayStation 5', category: 'Gaming', weight: 1 },
  { id: '3', text: 'MacBook Air M3', category: 'Gadgets', weight: 1 },
  { id: '4', text: '$200 Amazon Voucher', category: 'Vouchers', weight: 2 },
  { id: '5', text: 'AirPods Pro 2', category: 'Gadgets', weight: 1 },
  { id: '6', text: 'Nintendo Switch OLED', category: 'Gaming', weight: 1 },
  { id: '7', text: '$100 Steam Gift Card', category: 'Vouchers', weight: 3 },
  { id: '8', text: 'Dinner for Two Voucher', category: 'Vouchers', weight: 2 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  duration: 5,
  soundEnabled: true,
  confettiEnabled: true,
  containerBgColor: '#ffffff',
  containerTextColor: '#0f172a',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  randomizeFontOnShuffle: true,
  allowRepeatWinners: false,
  selectedCategory: 'ALL',
  activeBatchId: 'default-batch',
};
