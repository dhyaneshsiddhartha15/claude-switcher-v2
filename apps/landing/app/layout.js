import './globals.css';

export const metadata = {
  title: 'ClaudeSwitch — switch Claude Code accounts instantly',
  description:
    'An open-source multi-account switcher for Claude Code. Save personal, work, and shared accounts, and swap between them without logging out or re-entering an OTP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
