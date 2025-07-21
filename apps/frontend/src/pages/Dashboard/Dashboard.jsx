import {React, useEffect} from 'react';

const Dashboard = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p className="text-gray-700">Welcome to the dashboard!</p>
                {/* Add your dashboard components here */}
            </div>
        </div>
    );
}
export default Dashboard;