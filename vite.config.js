import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import process from 'node:process';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const PRIVATE_API_BASE_URL = env.VITE_APP_API_URL;
  return {
    plugins: [react(), svgr(), basicSsl()],
    server: {
      host: true,
      port: 5173,
      https: true,
      proxy: {
        '/api': {
          target: PRIVATE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          //rewrite: (p) => p.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // 백엔드가 동일 오리진 요청처럼 인식하도록 Origin/Referer 재작성
              proxyReq.setHeader('origin', PRIVATE_API_BASE_URL);
              proxyReq.setHeader('referer', PRIVATE_API_BASE_URL);
            });
          },
        },
      },
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
  };
});
