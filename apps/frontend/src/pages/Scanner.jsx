import {React, useEffect} from 'react';

const Scanner = () => {
    useEffect(() => {
        document.title = "Scanner";
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Scanner</h1>
                <p className="text-gray-700">Use the scanner to manage your inventory items.</p>
                {/* Add your scanner components here */}
            </div>
        </div>
    );
}

export default Scanner;
