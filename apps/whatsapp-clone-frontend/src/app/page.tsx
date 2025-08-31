export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tailwind CSS Test
          </h1>
          <p className="text-gray-600 mt-2">
            If you can see this styled, Tailwind is working!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded">
            This is a blue alert box with Tailwind classes
          </div>
          
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Green Button
          </button>
          
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Red Button
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>If you see colors, shadows, and rounded corners, Tailwind is working!</p>
        </div>
      </div>
    </div>
  );
}
