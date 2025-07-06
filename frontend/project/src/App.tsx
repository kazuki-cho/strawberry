import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <h1>Hello World</h1>
      </main>
      <Footer />
    </div>
  );
};

export default App;
