import {React, useEffect} from 'react';


const Inventory = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
                <p className="text-gray-700">Manage your inventory items here.</p>
                {/* Add your inventory components here */}
            </div>
        </div>
    );
}

export default Inventory;
