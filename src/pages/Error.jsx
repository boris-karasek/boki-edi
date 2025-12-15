import React from "react";

const ErrorPage = () => {
  const redirectToHome = () => {
    window.location.href = "https://boki-edi.com";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200">
      <h1 className="text-9xl font-bold text-red-500">404</h1>
      <p className="text-xl mt-4">
        Oops! The page you're looking for can't be found.
      </p>
      <button
        className="mt-6 px-6 py-3 bg-cyan-600 text-white text-lg rounded hover:bg-cyan-800 transition"
        onClick={redirectToHome}
      >
        Return to Home
      </button>
    </div>
  );
};

export default ErrorPage;
