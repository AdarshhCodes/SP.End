import { useEffect } from 'react';
import { MapPin, Camera, Bell, ShieldCheck } from 'lucide-react';
import { useNativeFeatures } from '../hooks/useNativeFeatures';

export default function NativeFeatures() {
    const {
        location,
        photo,
        getCurrentLocation,
        takePhoto,
        showLocalNotification,
        requestPermissions
    } = useNativeFeatures();

    useEffect(() => {
        // Request permissions on mount if we're on a native platform
        requestPermissions();
    }, []);

    return (
        <div className="glass-card rounded-[32px] p-6 mb-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-slate-900">Native App Features</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GPS Section */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <h4 className="font-bold text-sm">GPS / Location</h4>
                    </div>
                    <button
                        onClick={getCurrentLocation}
                        className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                    >
                        Get Location
                    </button>
                    {location && (
                        <div className="mt-3 text-[10px] text-gray-400">
                            <p>Lat: {location.lat.toFixed(4)}</p>
                            <p>Lng: {location.lng.toFixed(4)}</p>
                        </div>
                    )}
                </div>

                {/* Camera Section */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Camera className="w-5 h-5 text-purple-400" />
                        <h4 className="font-bold text-sm">Camera</h4>
                    </div>
                    <button
                        onClick={takePhoto}
                        className="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
                    >
                        Take Photo
                    </button>
                    {photo && (
                        <div className="mt-3">
                            <img src={photo} alt="Captured" className="w-full h-20 object-cover rounded-lg" />
                        </div>
                    )}
                </div>

                {/* Notification Section */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-sm">Notifications</h4>
                    </div>
                    <button
                        onClick={() => showLocalNotification('Test Notification', 'Success! Capacitor notifications are working.')}
                        className="w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors"
                    >
                        Send Test Alert
                    </button>
                </div>
            </div>
        </div>
    );
}
