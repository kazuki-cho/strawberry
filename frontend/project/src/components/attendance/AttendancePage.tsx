import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AttendanceList from './AttendanceList';
import AttendanceForm from './AttendanceForm';
import LeaveRequest from './LeaveRequest';

const AttendancePage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AttendanceList />} />
      <Route path="edit" element={<AttendanceForm />} />
      <Route path="leave" element={<LeaveRequest />} />
    </Routes>
  );
};

export default AttendancePage;