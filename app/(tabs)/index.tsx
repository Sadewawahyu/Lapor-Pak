// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { WebView } from "react-native-webview";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.72;
const cardSpacing = 16;

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

function getStatusColor(status?: string) {
  if (!status) return "#999";
  const s = String(status).toLowerCase();
  if (s === "baru") return "#FF4C4C";
  if (s === "proses") return "#FFA500";
  if (s === "selesai") return "#28A745";
  return "#999";
}

export default function HomeScreen() {
  const [laporan, setLaporan] = useState<any[]>([]);

  useEffect(() => {
    const laporanRef = ref(db, "laporan");

    const unsubscribe = onValue(laporanRef, (snap) => {
      const data = snap.val();
      if (!data || typeof data !== "object") {
        setLaporan([]);
        return;
      }

      const arr = Object.entries(data).map(([key, value]: any) => ({
        id: key,
        ...value,
      }));

      arr.sort(
        (a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime()
      );

      setLaporan(arr);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      <Text style={styles.title}>📢 LaporPak!!</Text>
      <Text style={styles.subtitle}>Aplikasi Pelaporan Cepat</Text>

      {/* MAIN BUTTON */}
      <TouchableOpacity
        style={styles.bigReportButton}
        onPress={() => router.push("/input-laporan")}
      >
        <Text style={styles.bigButtonIcon}>🚨</Text>
        <Text style={styles.bigButtonText}>Laporkan Kejadian</Text>
        <Text style={styles.bigButtonSub}>Klik untuk membuat laporan baru</Text>
      </TouchableOpacity>

      {/* Carousel Preview */}
      <Text style={styles.sectionTitle}>Preview Laporan</Text>
      {laporan.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada laporan</Text>
      ) : (
        <FlatList
          data={laporan}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + cardSpacing}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.cardPreview,
                { marginRight: index === laporan.length - 1 ? 16 : cardSpacing },
              ]}
            >
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.noImage]}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.judul || "Tanpa judul"}
                </Text>
                <Text style={styles.cardTime}>
                  {item.waktu ? new Date(item.waktu).toLocaleString() : "-"}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {String(item.status || "").toUpperCase() || "UNKNOWN"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Minimap */}
      <Text style={styles.sectionTitle}>Peta Laporan</Text>

      <View style={styles.miniMapBox}>
        <WebView
          source={require("@/assets/html/map.html")}
          style={{ flex: 1 }}
          injectedJavaScript={`
              // force zoom level normal
              if (typeof map !== "undefined") {
                map.setZoom(15);
              }
          `}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 30,
    marginHorizontal: 16,
  },
  subtitle: {
    fontSize: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    color: "#555",
  },

  bigReportButton: {
    marginHorizontal: 16,
    backgroundColor: "#0077B6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },
  bigButtonIcon: {
    fontSize: 32,
    color: "white",
    marginBottom: 4,
  },
  bigButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  bigButtonSub: {
    fontSize: 11,
    color: "#e0e0e0",
    marginTop: 2,
  },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 16, marginBottom: 8 },

  emptyText: { textAlign: "center", color: "#555", marginBottom: 12 },

  cardPreview: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: { width: "100%", height: 190, resizeMode: "cover" },
  noImage: { justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
  noImageText: { color: "#999" },
  cardInfo: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardTime: { fontSize: 12, color: "#666", marginBottom: 8 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // ⬇ INI MINIMAP KECIL ⬇
  miniMapBox: {
    height: 300,   // kecil tapi zoom normal
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 8,
  },
});
