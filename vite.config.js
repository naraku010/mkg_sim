import { defineConfig } from "vite";
import svgr from "@svgr/rollup";
import path from 'path';
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 4000,
        open: true,
        historyApiFallback: true, // SPA 라우팅 문제 방지
    },
    build: {
        assetsDir: 'assets', // 에셋 디렉토리 설정
        outDir: "dist",
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [path.resolve(__dirname, 'src')],
            },
        },
    },
    resolve: {
        alias: {
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@utils': path.resolve(__dirname, 'src/util'),
            '@store': path.resolve(__dirname, 'src/store'),
            '@styles': path.resolve(__dirname, 'src/styles'),
        },
    },
});
