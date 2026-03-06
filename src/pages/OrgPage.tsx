import React from 'react';
import { Tree, Input, Card } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, ApartmentOutlined } from '@ant-design/icons';

const treeData = [
    {
        title: 'ZIN Corporation',
        key: 'root',
        icon: <ApartmentOutlined />,
        children: [
            {
                title: '경영지원본부',
                key: 'mgmt',
                icon: <TeamOutlined />,
                children: [
                    {
                        title: '인사팀', key: 'hr', icon: <TeamOutlined />, children: [
                            { title: '김철수 (팀장)', key: 'p1', icon: <UserOutlined /> },
                            { title: '이영희', key: 'p2', icon: <UserOutlined /> },
                        ]
                    },
                    { title: '총무팀', key: 'ga', icon: <TeamOutlined /> },
                    { title: '재무팀', key: 'fin', icon: <TeamOutlined /> },
                ],
            },
            {
                title: 'IT서비스 부문',
                key: 'it',
                icon: <TeamOutlined />,
                children: [
                    {
                        title: '개발팀', key: 'dev', icon: <TeamOutlined />, children: [
                            { title: '박민수 (팀장)', key: 'p3', icon: <UserOutlined /> },
                            { title: '최지연', key: 'p4', icon: <UserOutlined /> },
                            { title: '홍길동', key: 'p5', icon: <UserOutlined /> },
                        ]
                    },
                    { title: '인프라팀', key: 'infra', icon: <TeamOutlined /> },
                    { title: 'QA팀', key: 'qa', icon: <TeamOutlined /> },
                ],
            },
            {
                title: '영업본부',
                key: 'sales',
                icon: <TeamOutlined />,
                children: [
                    { title: '국내영업팀', key: 'dom', icon: <TeamOutlined /> },
                    { title: '해외영업팀', key: 'intl', icon: <TeamOutlined /> },
                ],
            },
        ],
    },
];

const OrgPage: React.FC = () => {
    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>조직도</h2>
            <Card style={{ borderRadius: 6 }}>
                <Input
                    placeholder="이름, 부서 검색"
                    prefix={<SearchOutlined style={{ color: '#999' }} />}
                    style={{ marginBottom: 16, maxWidth: 300 }}
                    size="small"
                />
                <Tree
                    showIcon
                    defaultExpandedKeys={['root', 'it', 'dev']}
                    treeData={treeData}
                    style={{ fontSize: 13 }}
                />
            </Card>
        </div>
    );
};

export default OrgPage;
