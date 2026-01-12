import { IMediaAnalytics } from '../../contracts';

export class ShakaTracker {
    private player: any; 
    private analytics: IMediaAnalytics;
    private lastQualityId: string | null = null;

    constructor(player: any, analytics: IMediaAnalytics) {
        this.player = player;
        this.analytics = analytics;
        this.attachListeners();
    }

    private attachListeners() {
        if (!this.player) return;

        this.player.addEventListener('variantchanged', this.onVariantChanged);
        this.player.addEventListener('adaptation', this.onVariantChanged);
    }

    private onVariantChanged = () => {
        const tracks = this.player.getVariantTracks();
        const activeTrack = tracks.find((t: any) => t.active);
        
        if (activeTrack) {
             const id = activeTrack.id.toString();
             if (id !== this.lastQualityId) {
                 this.analytics.trackQualityChange(
                     activeTrack.bandwidth,
                     activeTrack.height,
                     activeTrack.width
                 );
                 this.lastQualityId = id;
             }
        }
    };

    public dispose() {
        if (!this.player) return;
        
        this.player.removeEventListener('variantchanged', this.onVariantChanged);
        this.player.removeEventListener('adaptation', this.onVariantChanged);
    }
}
