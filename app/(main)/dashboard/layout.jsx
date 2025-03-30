import React, { Suspense } from 'react'
import Dashboard from './page';
import { BarLoader } from 'react-spinners';

const DashboardLayout = () => {
  return (
    <div className='px-5'>
        <h1 className='text-6xl font-bold gradient-title mb-5'>Dashboard</h1>
        
        {/* Dashboard Page */}
        <Suspense fallback={<BarLoader/>}>
            <Dashboard/>
        </Suspense>
    </div>
  )
}

export default DashboardLayout