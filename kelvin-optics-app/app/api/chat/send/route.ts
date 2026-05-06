// app/api/chat/send/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import mqtt from 'mqtt';

// MQTT broker configuration – same as your ESP32
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const TOPIC_CHAT_IN = 'kelvin/chat/in';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId, username } = verifyToken(token);

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // 1. Save the message to the database
    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        userId,
      },
      include: { user: { select: { username: true } } },
    });

    // 2. Publish to MQTT broker so the ESP32 receives it
    try {
      const client = mqtt.connect(MQTT_BROKER, {
        clientId: 'nextjs_' + Math.random().toString(16).substring(2, 10),
        connectTimeout: 5000,
        clean: true,
      });

      // Generate a chatId – you can also accept one from the client if needed
      const chatId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const mqttPayload = JSON.stringify({
        user: message.user.username,
        text: message.text,
        chatId: chatId,
      });

      client.on('connect', () => {
        client.publish(TOPIC_CHAT_IN, mqttPayload, { qos: 0 }, (err) => {
          if (err) {
            console.error('MQTT publish error:', err);
          } else {
            console.log('Published to', TOPIC_CHAT_IN, mqttPayload);
          }
          client.end();  // disconnect after publishing
        });
      });

      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        client.end();
      });

    } catch (mqttErr) {
      console.error('Failed to publish MQTT message:', mqttErr);
      // Don't fail the whole request – the message is already saved
    }

    return NextResponse.json({
      id: message.id,
      user: message.user.username,
      text: message.text,
      createdAt: message.createdAt,
      isSelf: true,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}