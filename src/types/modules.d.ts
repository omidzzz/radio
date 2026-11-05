// Raw text imports (`?raw`) — e.g. in-lining an SVG's source so its embedded
// <style>/animations run and its var(--color-*) tokens follow the active theme.
declare module "*?raw" {
  const content: string;
  export default content;
}
