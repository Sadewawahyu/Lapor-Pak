// app/(tabs)/explore.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "firebase/database";

// FIREBASE CONFIG
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

export default function ExploreScreen() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // filters
  const [statusFilter, setStatusFilter] = useState(""); // "baru" | "proses" | "selesai" or ""
  const [jenisFilter, setJenisFilter] = useState(""); // "kriminalitas" | "kecelakaan" | "lainnya" or ""

  // LOAD DATA
  useEffect(() => {
    const laporanRef = ref(db, "laporan");
    const unsub = onValue(laporanRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setLaporan([]);
        return;
      }

      const arr = Object.entries(data).map(([key, value]: any) => ({
        id: key,
        ...value,
      }));

      setLaporan(arr);
    });

    return () => unsub();
  }, []);

  // DELETE
  const deleteLaporan = (id: string) => {
    Alert.alert("Hapus Laporan", "Yakin ingin menghapus laporan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => remove(ref(db, `laporan/${id}`)),
      },
    ]);
  };

  // FILTERING (NORMALIZED -> lowercased)
  const filtered = laporan
    .filter((x) => {
      const q = (search || "").toString().toLowerCase().trim();
      if (!q) return true;

      const title = (x.judul || "").toString().toLowerCase();
      const lat = x.latitude != null ? String(x.latitude) : "";
      const lng = x.longitude != null ? String(x.longitude) : "";
      const coordStr = `${lat},${lng}`;

      return title.includes(q) || coordStr.includes(q);
    })
    .filter((x) => {
      if (!statusFilter) return true;
      return String(x.status || "").toLowerCase() === statusFilter.toLowerCase();
    })
    .filter((x) => {
      if (!jenisFilter) return true;
      // normalize stored jenis and filter both to lower
      return String(x.jenis || "").toLowerCase() === jenisFilter.toLowerCase();
    });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daftar Laporan</Text>

      {/* add new */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/input-laporan")}
      >
        <FontAwesome name="plus" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Laporan</Text>
      </TouchableOpacity>

      {/* search */}
      <TextInput
        style={styles.search}
        placeholder="Cari laporan (judul/koordinat)..."
        value={search}
        onChangeText={setSearch}
      />

      {/* status filters */}
      <Text style={styles.filterTitle}>Filter Status:</Text>
      <View style={styles.filterRow}>
        {["baru", "proses", "selesai"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(statusFilter === s ? "" : s)}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
          >
            <Text style={[styles.filterBtnText, statusFilter === s && styles.filterBtnTextActive]}>
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* jenis filters */}
      <Text style={styles.filterTitle}>Filter Jenis:</Text>
      <View style={styles.filterRow}>
        {["kriminalitas", "kecelakaan", "lainnya"].map((j) => (
          <TouchableOpacity
            key={j}
            onPress={() => setJenisFilter(jenisFilter === j ? "" : j)}
            style={[styles.filterBtn, jenisFilter === j && styles.filterBtnActive]}
          >
            <Text style={[styles.filterBtnText, jenisFilter === j && styles.filterBtnTextActive]}>
              {j.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.judul}</Text>
              <Text style={styles.meta}>
                📍 {item.latitude?.toFixed?.(5)}, {item.longitude?.toFixed?.(5)}
              </Text>
              <Text style={styles.meta}>
                ⏱ {item.waktu ? new Date(item.waktu).toLocaleString() : "-"}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      String(item.status || "").toLowerCase() === "baru"
                        ? "#ff4d4d"
                        : String(item.status || "").toLowerCase() === "proses"
                        ? "#ffa500"
                        : "#2ecc71",
                  },
                ]}
              >
                <Text style={styles.badgeText}>{String(item.status || "").toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push({ pathname: "/edit", params: { id: item.id } })}
              >
                <FontAwesome name="pencil" size={20} color="#0077B6" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => deleteLaporan(item.id)}>
                <FontAwesome name="trash" size={20} color="#D00000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// styles (same as before)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginTop: 10, marginBottom: 12 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0077B6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  addButtonText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  filterTitle: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  filterBtnActive: {
    backgroundColor: "#0077B6",
  },
  filterBtnText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#fff",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 10,
  },

  title: { fontSize: 16, fontWeight: "bold" },
  meta: { fontSize: 12, color: "#666", marginTop: 3 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  actionContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
  },
  actionBtn: { padding: 6 },
});
