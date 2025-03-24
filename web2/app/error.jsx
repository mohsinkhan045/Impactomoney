'use client' // Error boundaries must be Client Components
 
export default function Error({error,reset,}) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg text-gray-600 mb-8">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">Try again</button>
    </div>
  )
}