import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export const useResponsive = () => {
    const [width, setWidth] = useState(() => window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        width,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width < TABLET_BREAKPOINT,
    };
};
