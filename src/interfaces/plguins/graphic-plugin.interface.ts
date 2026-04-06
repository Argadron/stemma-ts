export interface IGraphicPluginOptions {
    /**
     * Name of your game
     */
    readonly appName?: string;

    /**
     * Key-value assets, where asset is smile
     */
    readonly assets?: Record<string, string>;

    /**
     * Height of box
     */
    readonly height?: number;

    /**
     * Set grid of box. Replace it only if you know what do
     */
    readonly grid?: [number, number];

    /**
     * Width of box
     */
    readonly width?: number;
}