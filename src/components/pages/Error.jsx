import React from 'react';
import { useNavigate } from 'react-router-dom';

function Error() {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-purple-300 to-blue-200 min-h-screen flex items-center justify-center">
            <div className="w-9/12 m-auto py-16">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg pb-8 text-center">
                    <div className="border-t border-gray-200 pt-8">
                        <div className="text-9xl font-bold text-yellow-400">404</div>
                        <div className="text-6xl font-medium py-8 text-gray-600">Oops! Page not found</div>
                        <p className="text-2xl pb-8 px-12 font-medium text-gray-500">
                            The page you are looking for does not exist. It might have been moved or deleted.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-custom px-6 py-3 rounded-md mr-6"
                        >
                            BACK TO HOME
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="btn-default"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Error;
