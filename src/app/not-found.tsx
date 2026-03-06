export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500">404</h1>
        <p className="mt-2 text-gray-500">Page not found</p>
        <a href="/" className="mt-4 inline-block text-orange-500 hover:text-orange-600">
          Go home
        </a>
      </div>
    </div>
  );
}
