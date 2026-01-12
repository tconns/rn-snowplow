import { IAppAnalytics } from '../contracts';

type Fn<T> = (p: T) => void;

export class AppDispatcher implements IAppAnalytics {
    constructor(private providers: IAppAnalytics[]) {}

    private dispatch(fn: Fn<IAppAnalytics>) {
        this.providers.forEach(p => { try { fn(p); } catch (e) { console.warn('[AppDispatcher]', e); } });
    }

    trackPageView = (title?: string) => this.dispatch(p => p.trackPageView(title));
    trackStructEvent = (cat: string, act: string, lbl?: string, val?: number) => this.dispatch(p => p.trackStructEvent(cat, act, lbl, val));
    trackScreenView = (name: string, id?: string) => this.dispatch(p => p.trackScreenView(name, id));
    trackSelfDescribingEvent = (schema: string, data: Record<string, unknown>) => this.dispatch(p => p.trackSelfDescribingEvent(schema, data));
    trackSiteSearch = (terms: string[], filters?: Record<string, unknown>, total?: number) => this.dispatch(p => p.trackSiteSearch(terms, filters, total));
    setGlobalContext = (ctx: Record<string, unknown>) => this.dispatch(p => p.setGlobalContext(ctx));
}
