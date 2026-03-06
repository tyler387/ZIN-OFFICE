import React from 'react';

const DefaultSubMenu: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            {title} 메뉴
        </div>
    );
};

export default DefaultSubMenu;
