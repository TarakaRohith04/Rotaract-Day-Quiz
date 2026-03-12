import React from 'react';

const Header = ({ onHome }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 
          className="project-title" 
          onClick={onHome}
          style={{ cursor: 'pointer' }}
        >
          Project <span className="telugu-text">అభ్యాసం</span>
        </h1>
      </div>
      <div className="header-right">
        <span className="initiative-text">Initiative by Rotaract Club of Vijayawada Elite League</span>
        <img
          src="/Vijayawada_Elite_League.png"
          alt="Vijayawada Elite League Logo"
          className="club-logo-small"
        />
      </div>
    </header>
  );
};

export default Header;
