import { useEffect, useRef } from 'react';
import api, { KEEPALIVE_TIMEOUT } from '../api';

/** Interval (ms) between keep-alive pings. Helps prevent backend spin-down on Render. */
const KEEPALIVE_INTERVAL = 2 * 60 * 1000;

/**
 * Pings the backend health endpoint periodically while the app is mounted.
 * Complements UptimeRobot: when users have the page open, more frequent pings
 * help keep the backend warm. Runs silently; no UI impact.
 */
export function useKeepAlive() {
    const intervalRef = useRef(null);

    useEffect(() => {
        const ping = () => {
            api.get('', { timeout: KEEPALIVE_TIMEOUT }).catch(() => {
                // Silent fail: keep-alive is best-effort
            });
        };

        // Initial ping after a short delay (avoid duplicate with initial data fetches)
        const initialDelay = setTimeout(ping, 10000);

        intervalRef.current = setInterval(ping, KEEPALIVE_INTERVAL);

        return () => {
            clearTimeout(initialDelay);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
}
