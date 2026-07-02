const REPO_URL = 'https://github.com/claudeswitch/claudeswitch';

const FEATURES = [
  {
    title: 'Instant switching',
    body: 'Jump between personal, work, or a friend’s Claude account in one command — no logout, no OTP.',
  },
  {
    title: '100% local',
    body: 'Each account’s credentials live in their own folder on your machine. Nothing is uploaded anywhere.',
  },
  {
    title: 'CLI + tray app',
    body: 'Use it from the terminal, or from an optional system tray app on Windows, macOS, and Linux.',
  },
  {
    title: 'Open source, MIT',
    body: 'Small, auditable codebase. Fork it, self-host it, or send a PR.',
  },
];

const COMMANDS = [
  { code: 'claudeswitch add --name work', desc: 'save the current account' },
  { code: 'claudeswitch use work', desc: 'switch to it instantly' },
  { code: 'claudeswitch list', desc: 'see every saved account' },
  { code: 'claudeswitch remove work', desc: 'delete a saved account' },
];

export default function Home() {
  return (
    <>
      <nav className="nav container">
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
        <h1>Switch Claude Code accounts in one command.</h1>
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
        <div className="install-box">$ npm install -g claudeswitch</div>
      </section>

      <section className="features container">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="commands container">
        <h2>Four commands, that&rsquo;s it</h2>
        <div className="command-list">
          {COMMANDS.map((c) => (
            <div className="command-row" key={c.code}>
              <code>{c.code}</code>
              <span>{c.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer container">
        MIT licensed. Not affiliated with Anthropic. &middot;{' '}
        <a href={REPO_URL}>github.com/claudeswitch/claudeswitch</a>
      </footer>
    </>
  );
}
