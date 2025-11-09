import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const resolvePath = (str: string) => path.resolve(__dirname, str);

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react()],
    resolve: {
        alias: {
            src: resolvePath("./src"),
            "@app": resolvePath("./src/app"),
            "@assets": resolvePath("./src/assets"),
            "@components": resolvePath("./src/components"),
            "@config": resolvePath("./src/config"),
            "@features": resolvePath("./src/features"),
            "@hooks": resolvePath("./src/hooks"),
            "@lib": resolvePath("./src/lib"),
            "@stores": resolvePath("./src/stores"),
            "@testing": resolvePath("./src/testing"),
            "@types": resolvePath("./src/types"),
            "@utils": resolvePath("./src/utils"),
        },
    },
});
