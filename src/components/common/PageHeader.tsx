import React from 'react';

interface PageHeaderProps {
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, subtitle, extra }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
                <h2 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    {icon && <span style={{ color: 'var(--primary)' }}>{icon}</span>}
                    {title}
                </h2>
                {subtitle && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {subtitle}
                    </div>
                )}
            </div>
            {extra && <div>{extra}</div>}
        </div>
    );
};

export default PageHeader;
