import React from 'react'
import { Routes, Route } from "react-router";
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import CustomerRegister from './pages/CustomerRegister';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerSettings from './pages/CustomerSettings';
import ManagerRegister from './pages/ManagerRegister';
import ManagerLogin from './pages/ManagerLogin';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerSettings from './pages/ManagerSettings';
import BranchDashboard from './pages/BranchDashboard';
import BranchUpdate from './pages/BranchUpdate';
import ManageCustomer from './pages/ManageCustomer';
import ManageCustomerDetails from './pages/ManageCustomerDetails';
import ManageEmployee from './pages/ManageEmployee';
import ManageEmployeeDetails from './pages/ManageEmployeeDetails';
import ManageCar from './pages/ManageCar';
import ManageCarDetails from './pages/ManageCarDetails';
import ManageService from './pages/ManageService';
import ManageAssignment from './pages/ManageAssignment';
import CustomerSupport from './pages/CustomerSupport';
import CustomerCompletePayment from './pages/CustomerCompletePayment';
import CustomerPayments from './pages/CustomerPayments';
import CustomerPaymentDetails from './pages/CustomerPaymentDetails';

const App = () => {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/login" element={<CustomerLogin />} />

        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/completepayment/:id" element={<CustomerCompletePayment />} />
        <Route path="/customer/payments" element={<CustomerPayments />} />
        <Route path="/customer/payments/:id" element={<CustomerPaymentDetails />} />


        <Route path="/customer/settings" element={<CustomerSettings />} />
        <Route path="/customer/support" element={<CustomerSupport />} />

        <Route path="/manager/register" element={<ManagerRegister />} />
        <Route path="/manager/login" element={<ManagerLogin />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/settings" element={<ManagerSettings />} />

        <Route path="/manager/branch" element={<BranchDashboard />} />
        <Route path="/manager/branch/details/:id" element={<BranchUpdate />} />

        <Route path="/manager/customers" element={<ManageCustomer />} />
        <Route path="/manager/customers/:id" element={<ManageCustomerDetails />} />

        <Route path="/manager/employee" element={<ManageEmployee />} />
        <Route path="/manager/employee/:id" element={<ManageEmployeeDetails />} />

        <Route path="/manager/cars" element={<ManageCar />} />
        <Route path="/manager/cars/:id" element={<ManageCarDetails />} />

        <Route path="/manager/service" element={<ManageService />} />

        <Route path="/manager/assign" element={<ManageAssignment />} />



        <Route path="*" element={<NotFound />} />
      </Routes>
    </>

  )
}

export default App