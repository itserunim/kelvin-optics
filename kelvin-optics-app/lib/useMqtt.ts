// lib/useMqtt.ts
import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

export interface SensorData {
  temperature: number;
  pressure: number;
  time: string;
  displayOn: boolean;
  currentSlide: number;
  hasMessage: boolean;
}

export function useMqtt() {
  const [sensors, setSensors] = useState<SensorData>({
    temperature: 0,
    pressure: 0,
    time: '',
    displayOn: true,
    currentSlide: 0,
    hasMessage: false,
  });
  const clientRef = useRef<any>(null);

  useEffect(() => {
    // HiveMQ WebSocket endpoint – no username/password required
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt', {
      clientId: 'dashboard_' + Math.random().toString(16).substr(2, 8),
    });
    clientRef.current = client;

    client.on('connect', () => {
      client.subscribe('kelvin/sensors');
      // Optional: subscribe to chat/in if you want to see live messages on dashboard
      // client.subscribe('kelvin/chat/in');
    });

    client.on('message', (topic: string, message: Buffer) => {
      const data = JSON.parse(message.toString());
      if (topic === 'kelvin/sensors') {
        setSensors(data);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return { sensors, client: clientRef };
}