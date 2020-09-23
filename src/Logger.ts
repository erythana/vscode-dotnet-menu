import { LoggingModes } from './Models/LoggingModes';

export module Logger {
    export function logToConsole(message: string, type: LoggingModes) {
        console.log(`---${new Date().toLocaleTimeString()} ${LoggingModes[type]}\n${message}`);
    }
};