import {React, useEffect} from 'react';



const Register = () => {
    useEffect(() => {
        document.title = "Register";
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Register</h1>
                <p className="text-gray-700">Please fill out the form to create an account.</p>
                {/* Add your registration form components here */}
            </div>
        </div>
    );
}
export default Register;