import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useState } from 'react';

export const useNativeFeatures = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);

    const getCurrentLocation = async () => {
        try {
            const coordinates = await Geolocation.getCurrentPosition();
            setLocation({
                lat: coordinates.coords.latitude,
                lng: coordinates.coords.longitude,
            });
            return coordinates;
        } catch (error) {
            console.error('Error getting location', error);
            alert('Could not get location. Make sure GPS is on.');
        }
    };

    const takePhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
            });
            setPhoto(image.webPath || null);
            return image;
        } catch (error) {
            console.error('Error taking photo', error);
        }
    };

    const showLocalNotification = async (title: string, body: string) => {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: 1,
                        schedule: { at: new Date(Date.now() + 1000) },
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: '',
                        extra: null,
                    },
                ],
            });
        } catch (error) {
            console.error('Error showing notification', error);
        }
    };

    const requestPermissions = async () => {
        try {
            if (typeof window !== 'undefined') {
                const geoPerm = await Geolocation.requestPermissions();
                const camPerm = await Camera.requestPermissions();
                const notiPerm = await LocalNotifications.requestPermissions();

                console.log('Permissions:', { geoPerm, camPerm, notiPerm });
            }
        } catch (error) {
            console.error('Error requesting permissions', error);
        }
    };

    return {
        location,
        photo,
        getCurrentLocation,
        takePhoto,
        showLocalNotification,
        requestPermissions,
    };
};
