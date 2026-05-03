// Define the shape of the data coming from the ESP32
export interface SensorData {
    temperature: number;
    pressure: number;
    time: string;
}

export interface DeviceStatus {
    displayOn: boolean;
    currentSlide: number;
}

export interface ChatMessage {
    user: string;
    text: string;
    isSelf: boolean;
}