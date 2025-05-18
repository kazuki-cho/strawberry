import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-400">
          © {currentYear} 社内システム. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;