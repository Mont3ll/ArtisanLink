export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 flex items-center justify-between">
        <div className="text-sm">© {new Date().getFullYear()} ArtisanLink</div>
        <div className="flex gap-4 text-sm">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
