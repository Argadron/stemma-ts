export interface ICanvasPluginOptions {
    /**
     * HTML canvas reference
     */
    readonly canvas: HTMLCanvasElement;

    /**
     * Width of canvas
     */
    readonly width?: number;

    /**
     * Height of canvas
     */
    readonly height?: number;

    /**
     * Object of key-value sprites (for example, { hero: "./assets/hero.png" })
     */
    readonly assets?: Record<string, ICanvasAssetOptions>;

    /**
     * Optional rendering options
     */
    readonly render?: {
        /**
         * Base height, if cant found sprite
         */
        readonly defaultHeight?: number;

        /**
         * Base width, if cant found sprite
         */
        readonly defaultWidth?: number;

        /**
         * Base color, if cant found sprite
         */
        readonly defaultColor?: string;
    }
}

export interface ICanvasAssetOptions {
    /**
     * Source path to asset
     */
    readonly src: string;

    /**
     * Width of asset
     */
    readonly width?: number;

    /**
     * Height of asset
     */
    readonly height?: number;
}