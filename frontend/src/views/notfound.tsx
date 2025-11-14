// import React from 'react'

// const NotFound: React.FC = () => {
//   return (
//     <div className="p-4">
//       <h1 className="text-4xl font-bold font-montserrat">404 not found</h1>
//     </div>
//   );
// };

// export default NotFound;

import React from 'react';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-300">404</h1>
                <h2 className="text-4xl font-bold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Sorry, the page you're looking for doesn't exist.
                </p>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;