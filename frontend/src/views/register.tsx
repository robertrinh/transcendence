// import React from 'react'

// export default function Register() {
//   return (
//     <div className="p-4">
//       <h1 className="text-4xl font-bold font-montserrat">Registration Page</h1>
//     </div>
//   )
// }

import React from 'react';

export const Register: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">Tournament Registration</h1>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Join a Tournament</h2>
                    <p className="text-gray-600 mb-6">
                        Register for upcoming tournaments and compete against other players!
                    </p>
                    
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2">Weekly Tournament</h3>
                            <p className="text-gray-600 mb-2">Next tournament starts this Friday at 8PM</p>
                            <p className="text-sm text-gray-500 mb-3">Prize Pool: 100 points</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                                Register Now
                            </button>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2">Championship Cup</h3>
                            <p className="text-gray-600 mb-2">Monthly championship - Next month</p>
                            <p className="text-sm text-gray-500 mb-3">Prize Pool: 500 points</p>
                            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                                Register Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;