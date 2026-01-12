export interface IAppAnalytics {
    trackPageView(title?: string): void;
    trackStructEvent(category: string, action: string, label?: string, value?: number): void;
    trackScreenView(name: string, id?: string): void;
    trackSelfDescribingEvent(schema: string, data: Record<string, any>): void;
    trackSiteSearch(terms: string[], filters?: Record<string, any>, totalResults?: number): void;
    setGlobalContext(context: Record<string, any>): void;
}
