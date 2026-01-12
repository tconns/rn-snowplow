import { AppDispatcher } from '../core';
import { SnowplowProvider } from '../providers';
import { ConsoleProvider } from '../providers';

let dispatcherInstance: AppDispatcher | null = null;

export const useAppTracking = () => {
     if (!dispatcherInstance) {
         const snowplowService = SnowplowProvider.getInstance();
         const consoleService = new ConsoleProvider(); 
         
         dispatcherInstance = new AppDispatcher([
             consoleService,
             snowplowService
         ]);
    }

    return dispatcherInstance;
};
