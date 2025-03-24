// pages/unauthorized.js

export default function Unauthorized() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-lg text-gray-700">
            You do not have permission to view this page.
          </p>
          <a href="/" className="mt-6 inline-block text-blue-500 hover:underline">
            Go back to Home
          </a>
        </div>
      </div>
    );
  }
  