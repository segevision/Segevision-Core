/**
 * Applies the saved studio theme before first paint. Inline on purpose: doing this in
 * an effect would show a light flash to anyone working in dark mode.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('segevision-studio-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
