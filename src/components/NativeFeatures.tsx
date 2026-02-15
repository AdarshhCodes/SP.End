import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { useTheme } from '../contexts/ThemeContext';

export default function NativeFeatures() {
    const { theme } = useTheme();

    useEffect(() => {
        // Handle Status Bar
        const setupStatusBar = async () => {
            try {
                // Allow the app to render behind the status bar for a premium immersive look
                await StatusBar.setOverlaysWebView({ overlay: true });

                await StatusBar.setStyle({
                    style: theme === 'dark' ? Style.Dark : Style.Light,
                });

                // Match the background of our app (make it transparent so it flows)
                await StatusBar.setBackgroundColor({ color: 'transparent' });
            } catch (error) {
                console.warn('Status bar not available on this platform');
            }
        };

        setupStatusBar();
    }, [theme]);

    useEffect(() => {
        // Handle Android Hardware Back Button
        const backButtonHandler = App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
                App.exitApp();
            } else {
                window.history.back();
            }
        });

        return () => {
            backButtonHandler.then(h => h.remove());
        };
    }, []);

    return null; // This component doesn't render anything UI-wise
}
