"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { SensorData, DeviceStatus, ChatMessage } from './index';

export function useWebSocket(ipAddress: string) {
const [sensors, setSensors] = useState<SensorData>({ temperature: 0, pressure: 0, time: "00:00" });
const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({ displayOn: false, currentSlide: 0 });
const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
const ws = useRef<WebSocket | null>(null);

useEffect(() => {
    if (!ipAddress) return;
    
    ws.current = new WebSocket(`ws://${ipAddress}:81`);
    
    ws.current.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "sensors") {
        setSensors({ 
            temperature: Number(data.temperature), 
            pressure: Number(data.pressure), 
            time: data.time });
        setDeviceStatus({ 
            displayOn: Boolean(data.displayOn), 
            currentSlide: Number(data.currentSlide) });
    } else if (data.type === "message") {
        // Handle broadcasted world chat messages
        setChatLog(prev => [...prev, { user: String(data.user || "Anonymous"), text: String(data.text), isSelf: false }]);
    } else if (data.type === "reply") {
        // Handle physical button replies from the Smart Glass wearer
        setChatLog(prev => [...prev, { user: "Kelvin HUD", text: String(data.text), isSelf: false }]);
    }
    };

    return () => ws.current?.close();
}, [ipAddress]);

const sendMessage = useCallback((user: string, text: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    // Payload matches the ESP32 JSON deserialization expectations
    const payload = { type: "message", user, text };
    ws.current.send(JSON.stringify(payload));
    
    // Optimistically add to local UI
    setChatLog(prev => [...prev, { user, text, isSelf: true }]);
}, []);

return { sensors, deviceStatus, chatLog, sendMessage };
}