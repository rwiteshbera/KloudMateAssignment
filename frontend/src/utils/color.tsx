export default function stringToColor(str: string): string {
    let hash = 0;
  
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
  
    const saturation = 70;
    const lightness = 50;
  
    // Convert HSL to a CSS-compatible string
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  