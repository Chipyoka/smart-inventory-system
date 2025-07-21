import {React, useEffect} from 'react';


const NotFound = () => {
    useEffect(() => {
        document.title = "Page Not Found";
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl text-center">
                <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-700">The page you are looking for does not exist.</p>
            </div>
        </div>
    );
}

export default NotFound;