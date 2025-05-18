import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';

const EmployeePage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<EmployeeList />} />
      <Route path="new" element={<EmployeeForm />} />
      <Route path=":id" element={<EmployeeDetail />} />
    </Routes>
  );
};

export default EmployeePage;