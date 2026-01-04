import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Fuente de Salvación Misionera INC.",
        short_name: "Fuente de Salvación",
        description: "Una familia de Fe y Esperanza en San Cristóbal.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1d4ed8",
        icons: [
            {
                src: "/icons/android-chrome-192x192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
            },
            {
                src: "/icons/android-chrome-512x512.svg",
                sizes: "512x512",
                type: "image/svg+xml",
            },
        ],
    };
}
