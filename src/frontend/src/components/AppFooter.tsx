export function AppFooter() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  return (
    <footer className="py-6 border-t border-border">
      <p className="text-center text-xs text-muted-foreground">
        © {year} AdEarn.{" "}
        <a
          href={utm}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </p>
    </footer>
  );
}
