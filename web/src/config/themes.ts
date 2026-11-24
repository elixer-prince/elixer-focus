export interface ThemeInfo {
  value: string;
  label: string;
  category: "daisyui" | "custom" | "premium";
}

const daisyuiThemes: ThemeInfo[] = [
  { value: "light", label: "Light", category: "daisyui" },
  { value: "dark", label: "Dark", category: "daisyui" },
  { value: "cupcake", label: "Cupcake", category: "daisyui" },
  { value: "bumblebee", label: "Bumblebee", category: "daisyui" },
  { value: "emerald", label: "Emerald", category: "daisyui" },
  { value: "corporate", label: "Corporate", category: "daisyui" },
  { value: "synthwave", label: "Synthwave", category: "daisyui" },
  { value: "retro", label: "Retro", category: "daisyui" },
  { value: "cyberpunk", label: "Cyberpunk", category: "daisyui" },
  { value: "valentine", label: "Valentine", category: "daisyui" },
  { value: "halloween", label: "Halloween", category: "daisyui" },
  { value: "garden", label: "Garden", category: "daisyui" },
  { value: "forest", label: "Forest", category: "daisyui" },
  { value: "aqua", label: "Aqua", category: "daisyui" },
  { value: "lofi", label: "Lofi", category: "daisyui" },
  { value: "pastel", label: "Pastel", category: "daisyui" },
  { value: "fantasy", label: "Fantasy", category: "daisyui" },
  { value: "wireframe", label: "Wireframe", category: "daisyui" },
  { value: "black", label: "Black", category: "daisyui" },
  { value: "luxury", label: "Luxury", category: "daisyui" },
  { value: "dracula", label: "Dracula", category: "daisyui" },
  { value: "cmyk", label: "Cmyk", category: "daisyui" },
  { value: "autumn", label: "Autumn", category: "daisyui" },
  { value: "business", label: "Business", category: "daisyui" },
  { value: "acid", label: "Acid", category: "daisyui" },
  { value: "lemonade", label: "Lemonade", category: "daisyui" },
  { value: "night", label: "Night", category: "daisyui" },
  { value: "coffee", label: "Coffee", category: "daisyui" },
  { value: "winter", label: "Winter", category: "daisyui" },
  { value: "dim", label: "Dim", category: "daisyui" },
  { value: "nord", label: "Nord", category: "daisyui" },
  { value: "sunset", label: "Sunset", category: "daisyui" },
  { value: "caramellatte", label: "Caramellatte", category: "daisyui" },
  { value: "abyss", label: "Abyss", category: "daisyui" },
  { value: "silk", label: "Silk", category: "daisyui" },
];

const customThemes: ThemeInfo[] = [
  { value: "elixer", label: "Elixer", category: "custom" },
];

const premiumThemes: ThemeInfo[] = [
  { value: "pirate", label: "Pirate", category: "premium" },
  { value: "monarch", label: "Monarch", category: "premium" },
  { value: "baldy", label: "Baldy", category: "premium" },
  { value: "daiki", label: "Daiki", category: "premium" },
  { value: "emilia", label: "Emilia", category: "premium" },
  { value: "leila", label: "Leila", category: "premium" },
  { value: "natsu", label: "Natsu", category: "premium" },
  { value: "frosted", label: "Frosted", category: "premium" },
  { value: "liquid", label: "Liquid", category: "premium" },
];

export const allThemes: ThemeInfo[] = [
  ...daisyuiThemes,
  ...customThemes,
  ...premiumThemes,
];

export const validThemeNames = new Set(allThemes.map((t) => t.value));
