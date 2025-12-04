// app/input-laporan.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, push, ref } from "firebase/database";

// ======================================================
// FIREBASE CONFIG
// ======================================================
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

export default function InputLaporan() {
  const [judul, setJudul] = useState("");
  const [jenis, setJenis] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const [modalJenis, setModalJenis] = useState(false);

  const pilihanJenis = ["Kriminalitas", "Kecelakaan", "Lainnya"];

  // ======================================================
  // AMBIL LOKASI
  // ======================================================
  const ambilLokasi = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin lokasi ditolak");
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      Alert.alert("Lokasi diambil!", "Koordinat berhasil diperoleh.");
    } catch (e) {
      console.log("Error lokasi:", e);
      Alert.alert("Error", "Gagal mengambil lokasi");
    }
  };

  // ======================================================
  // AMBIL FOTO
  // ======================================================
  const ambilFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin akses foto ditolak");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (res.canceled || res.cancelled) return;

      if (res.assets && res.assets.length > 0) {
        setFotoUri(res.assets[0].uri);
      }
    } catch (e) {
      console.log("Error image picker:", e);
      Alert.alert("Error", "Gagal memilih foto");
    }
  };

  // ======================================================
  // SUBMIT LAPORAN
  // ======================================================
  const submit = async () => {
    if (!judul.trim() || !jenis.trim()) {
      Alert.alert("Form belum lengkap");
      return;
    }
    if (!coords) {
      Alert.alert("Lokasi belum diambil");
      return;
    }

    try {
      await push(ref(db, "laporan"), {
        judul,
        jenis,
        deskripsi,
        status: "baru",
        latitude: coords.latitude,
        longitude: coords.longitude,
        foto: fotoUri,
        waktu: new Date().toISOString(),
      });

      Alert.alert("Sukses", "Laporan berhasil dikirim!");
      router.back();
    } catch (e) {
      console.log("Error submit:", e);
      Alert.alert("Error", "Gagal mengirim laporan");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ================= CARD ================= */}
      <View style={styles.card}>
        <Text style={styles.title}>Input Laporan</Text>

        {/* FOTO */}
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Belum ada foto</Text>
          </View>
        )}

        <TouchableOpacity style={styles.btnSecondary} onPress={ambilFoto}>
          <Text style={styles.btnSecondaryText}>📷 Pilih Foto</Text>
        </TouchableOpacity>

        {/* INPUT JUDUL */}
        <TextInput
          style={styles.input}
          placeholder="Judul Laporan"
          value={judul}
          onChangeText={setJudul}
        />

        {/* DROPDOWN JENIS LAPORAN */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setModalJenis(true)}
        >
          <Text style={{ color: jenis ? "#000" : "#777" }}>
            {jenis || "Pilih Jenis Laporan"}
          </Text>
        </TouchableOpacity>

        {/* MODAL JENIS */}
        <Modal transparent visible={modalJenis} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Pilih Jenis Laporan</Text>

              {pilihanJenis.map((j) => (
                <Pressable
                  key={j}
                  onPress={() => {
                    setJenis(j);
                    setModalJenis(false);
                  }}
                >
                  <Text style={styles.modalItem}>{j}</Text>
                </Pressable>
              ))}

              <Pressable
                style={styles.modalClose}
                onPress={() => setModalJenis(false)}
              >
                <Text style={{ color: "#fff" }}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* DESKRIPSI */}
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Deskripsi Singkat"
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
        />

        {/* KOORDINAT */}
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>Koordinat</Text>

          <Text style={styles.coordValue}>
            {coords
              ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
              : "Belum diambil"}
          </Text>

          <TouchableOpacity style={styles.btnSecondarySmall} onPress={ambilLokasi}>
            <Text style={styles.btnSecondaryText}>📍 Ambil Lokasi</Text>
          </TouchableOpacity>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity style={styles.btnSubmit} onPress={submit}>
          <Text style={styles.btnSubmitText}>Kirim Laporan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ======================================================
// STYLE
// ======================================================
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F2F4F7",
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },

  placeholderBox: {
    width: "100%",
    height: 220,
    backgroundColor: "#E6E6E6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  placeholderText: {
    color: "#777",
    fontStyle: "italic",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },

  coordBox: {
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },

  coordLabel: { fontWeight: "bold" },
  coordValue: { marginVertical: 8 },

  btnSecondary: {
    backgroundColor: "#E8F3FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },

  btnSecondarySmall: {
    backgroundColor: "#E8F3FF",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },

  btnSecondaryText: {
    color: "#0077B6",
    textAlign: "center",
    fontWeight: "bold",
  },

  btnSubmit: {
    backgroundColor: "#D00000",
    padding: 14,
    borderRadius: 10,
  },

  btnSubmitText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  modalItem: {
    paddingVertical: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalClose: {
    backgroundColor: "#D00000",
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    alignItems: "center",
  },
});
