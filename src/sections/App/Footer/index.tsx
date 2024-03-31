export default function Footer() {
  return (
    <footer className="w-full h-auto py-1 px-10 border-t border-gray-400">
      <div className="flex flex-row justify-between">
        <p className="text-gray-500 text-sm">© 2024-{__COPYRIGHT_YEAR__} Devin Bidwell</p>
        <p className="text-gray-500 text-sm">Version {__APP_VERSION__}</p>
      </div>
    </footer>
  );
}
