import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livingwell.app',
  appName: 'Living Well',
  webDir: 'dist', // 假设构建输出目录为 dist
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#39ff14",
      sound: "beep.wav",
    },
    // HealthKit 插件配置（如果使用插件需要配置权限说明）
    CapacitorHealthkit: {
        permissions: {
            read: ["steps", "heart_rate"], 
            write: [] 
        }
    }
  }
};

export default config;