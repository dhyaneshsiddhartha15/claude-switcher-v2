'use client';

import { useState } from 'react';

const REPO_URL = 'https://github.com/dhyaneshsiddhartha15/claude-switcher-v2';
const INSTALL_CMD = 'npm install -g claude-multi-account';

const FEATURES = [
  {
    emoji: '⚡',
    title: 'Instant switching',
    body: 'Jump between personal, work, or a friend’s Claude account in one command — no logout, no OTP.',
  },
  {
    emoji: '🔒',
    title: '100% local',
    body: 'Each account’s credentials live in their own folder on your machine. Nothing is uploaded anywhere.',
  },
  {
    emoji: '🖥️',
    title: 'CLI + tray app',
    body: 'Use it from the terminal, or from an optional system tray app on Windows, macOS, and Linux.',
  },
  {
    emoji: '🪄',
    title: 'Open source, MIT',
    body: 'Small, auditable codebase. Fork it, self-host it, or send a PR.',
  },
];

const STEPS = [
  {
    title: 'Log in and save',
    body: 'Log in to Claude Code as usual, then snapshot that account under a name.',
    code: 'claudeswitch add --name work',
  },
  {
    title: 'Add as many as you like',
    body: 'Log into another account and save it too. Personal, work, a shared team seat — no limit.',
    code: 'claudeswitch add --name personal',
  },
  {
    title: 'Switch in one command',
    body: 'Point Claude Code at any saved account instantly. No logout, no verification code.',
    code: 'claudeswitch use work',
  },
];

const COMMANDS = [
  { code: 'claudeswitch add --name work', desc: 'save the current account' },
  { code: 'claudeswitch use work', desc: 'switch to it instantly' },
  { code: 'claudeswitch list', desc: 'see every saved account' },
  { code: 'claudeswitch remove work', desc: 'delete a saved account' },
];

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older/non-secure contexts
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`copy-btn${copied ? ' copied' : ''}`}
      onClick={copy}
      aria-label={`Copy: ${text}`}
      title="Copy to clipboard"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

export default function Home() {
  return (
    <>
      <nav className="nav container glass">
        <a className="brand" href="/">
          <span className="brand-dot" />
          ClaudeSwitch
        </a>
        <div className="nav-links">
          <a href={REPO_URL}>GitHub</a>
          <a href={`${REPO_URL}#readme`}>Docs</a>
          <a href={`${REPO_URL}/blob/main/LICENSE`}>License</a>
        </div>
      </nav>

      <section className="hero container">
        <h1>Switch Claude accounts without logging out.</h1>
        <p>
          An open-source multi-account switcher for Claude Code. Save your personal, work, and
          shared accounts locally, and swap between them instantly — without logging out or
          entering an OTP again.
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href={REPO_URL}>
            View on GitHub
          </a>
          <a className="btn btn-secondary" href={`${REPO_URL}#readme`}>
            Read the docs
          </a>
        </div>
        <div className="install-box glass">
          <code>$ {INSTALL_CMD}</code>
          <CopyButton text={INSTALL_CMD} />
        </div>
      </section>

      <section className="features container">
        {FEATURES.map((f) => (
          <div className="feature glass" key={f.title}>
            <span className="emoji">{f.emoji}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="steps container">
        <div className="section-head">
          <h2>How it works</h2>
          <p>Three steps, then you never re-authenticate to switch again.</p>
        </div>
        <div className="step-grid">
          {STEPS.map((s, i) => (
            <div className="step glass" key={s.title}>
              <div className="step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <div className="step-code">
                <code>{s.code}</code>
                <CopyButton text={s.code} label="⧉" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="commands container">
        <div className="section-head">
          <h2>Four commands, that’s it</h2>
          <p>Everything ClaudeSwitch does, from your terminal.</p>
        </div>
        <div className="command-list glass">
          {COMMANDS.map((c) => (
            <div className="command-row" key={c.code}>
              <code>{c.code}</code>
              <span className="desc">{c.desc}</span>
              <CopyButton text={c.code} label="⧉" />
            </div>
          ))}
        </div>
      </section>

      <footer className="footer container glass">
        MIT licensed. Not affiliated with Anthropic. ·{' '}
        <a href={REPO_URL}>github.com/dhyaneshsiddhartha15/claude-switcher-v2</a>
      </footer>
    </>
  );
}
