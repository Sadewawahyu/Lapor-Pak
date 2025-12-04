// app/tabs/map.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDfY4qyOfZ9ay3SVsB97IevixHYQrDsLtw",
  authDomain: "laporpak-74868.firebaseapp.com",
  projectId: "laporpak-74868",
  storageBucket: "laporpak-74868.firebasestorage.app",
  messagingSenderId: "670479597646",
  appId: "1:670479597646:web:1a1e836e2cddfe4378831f",
  measurementId: "G-0BTYW6ND28",
  databaseURL: "https://laporpak-74868-default-rtdb.firebaseio.com/",
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

export default function MapScreen() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [webviewLoaded, setWebviewLoaded] = useState(false);
  const [legendVisible, setLegendVisible] = useState(true);

  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(require("../../assets/html/map-visual.html"));
      await asset.downloadAsync();
      setHtmlUri(asset.localUri ?? null);
    })();
  }, []);

  useEffect(() => {
    const laporanRef = ref(db, "laporan");
    const unsub = onValue(laporanRef, (snap) => {
      const data = snap.val();
      if (!data) return setLaporan([]);
      const arr = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
      setLaporan(arr);
    });
    return () => unsub();
  }, []);

  const injectData = (items: any[]) => `
    window.laporanData = ${JSON.stringify(items)};
    window.renderMarkers && window.renderMarkers();
    true;
  `;

  useEffect(() => {
    if (webviewLoaded && webviewRef.current) {
      webviewRef.current.injectJavaScript(injectData(laporan));
    }
  }, [laporan, webviewLoaded]);

  const toggleLegend = () => {
    const newVal = !legendVisible;
    setLegendVisible(newVal);
    webviewRef.current?.injectJavaScript(`
      window.setLegendVisible(${newVal});
      true;
    `);
  };

  if (!htmlUri)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0077B6" />
        <Text>Memuat Peta...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        source={{ uri: htmlUri }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        onLoadEnd={() => {
          setWebviewLoaded(true);
          webviewRef.current?.injectJavaScript(injectData(laporan));
          webviewRef.current?.injectJavaScript(`window.setLegendVisible(${legendVisible}); true;`);
        }}
        style={{ flex: 1 }}
      />

      {/* Toggle berada di bawah legenda */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          legendVisible ? styles.on : styles.off,
        ]}
        onPress={toggleLegend}
      >
        <Text style={styles.toggleText}>
          {legendVisible ? "Sembunyikan" : "Tampilkan"} Legenda
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  toggleButton: {
    position: "absolute",
    left: 12,
    bottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 5,
  },

  toggleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  on: { backgroundColor: "#0077B6" },
  off: { backgroundColor: "#555" },
});
