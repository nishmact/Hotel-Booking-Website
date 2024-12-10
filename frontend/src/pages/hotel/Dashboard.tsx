import Layout from "../../layout/hotel/Layout";


const Dashboard = () => {
    return (
      <Layout>
            <h1 className="text-2xl font-semibold mb-6">Hotel Dashboard</h1>

            {/* Demo Graph Section */}
            <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="flex flex-col">
                    {/* Bar Graph */}
                    <div className="flex items-center mb-2">
                        <span className="w-1/4">January</span>
                        <div className="w-3/4 bg-gray-300 h-6 relative">
                            <div className="bg-blue-600 h-6" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <span className="w-1/4">February</span>
                        <div className="w-3/4 bg-gray-300 h-6 relative">
                            <div className="bg-blue-600 h-6" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <span className="w-1/4">March</span>
                        <div className="w-3/4 bg-gray-300 h-6 relative">
                            <div className="bg-blue-600 h-6" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <span className="w-1/4">April</span>
                        <div className="w-3/4 bg-gray-300 h-6 relative">
                            <div className="bg-blue-600 h-6" style={{ width: '80%' }}></div>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <span className="w-1/4">May</span>
                        <div className="w-3/4 bg-gray-300 h-6 relative">
                            <div className="bg-blue-600 h-6" style={{ width: '90%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
            </Layout>
    );
};

export default Dashboard;
