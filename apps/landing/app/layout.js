import './globals.css';

export const metadata = {
  title: 'ClaudeSwitch — switch Claude Code accounts instantly',
  description:
    'An open-source multi-account switcher for Claude Code. Save personal, work, and shared accounts, and swap between them without logging out or re-entering an OTP.',
};

const noFlashTheme = `(function(){try{var t=localStorage.getItem('cs-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
