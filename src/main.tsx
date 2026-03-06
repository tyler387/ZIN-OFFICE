import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={koKR}
        theme={{
          token: {
            colorPrimary: '#00897B',
            colorPrimaryHover: '#00796B',
            borderRadius: 4,
            fontFamily:
              "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 13,
            colorBgContainer: '#FFFFFF',
          },
          components: {
            Table: {
              headerBg: '#FAFAFA',
              rowHoverBg: '#F5F5F5',
            },
            Menu: {
              itemSelectedBg: '#F0FAF8',
              itemSelectedColor: '#00897B',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
