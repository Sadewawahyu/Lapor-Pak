// app/edit.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Pressable,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";

import * as ImagePicker from "expo-image-picker";

// ============= FIREBASE CONFIG =============
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

export default function EditScreen() {
  const { id } = useLocalSearchParams();

  const [judul, setJudul] = useState("");
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("baru");
  const [deskripsi, setDeskripsi] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [foto, setFoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [modalJenis, setModalJenis] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);

  const jenisOptions = ["Kriminalitas", "Kecelakaan", "Lainnya"];
  const statusOptions = ["baru", "proses", "selesai"];

  // ======================================
  // LOAD DATA
  // ======================================
  useEffect(() => {
    if (!id) return;

    const refData = ref(db, `laporan/${id}`);
    onValue(refData, (snap) => {
      const data = snap.val();
      if (data) {
        setJudul(data.judul || "");
        setJenis(data.jenis || "");
        setStatus(data.status || "baru");
        setDeskripsi(data.deskripsi || "");
        setLatitude(data.latitude ?? null);
        setLongitude(data.longitude ?? null);
        setFoto(typeof data.foto === "string" ? data.foto : null);
      }
      setLoading(false);
    });
  }, [id]);

  // ======================================
  // AMBIL FOTO BARU
  // ======================================
  const pilihFoto = async () => {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (izin.status !== "granted") {
      return Alert.alert("Izin ditolak");
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled) return;
    setFoto(res.assets[0].uri);
  };

  // ======================================
  // UPDATE DATA
  // ======================================
  const simpan = async () => {
    try {
      await update(ref(db, `laporan/${id}`), {
        judul,
        jenis,
        status,
        deskripsi,
        latitude,
        longitude,
        foto,
      });

      Alert.alert("Sukses", "Laporan diperbarui!");
      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Gagal", "Tidak bisa update laporan");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ textAlign: "center" }}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Edit Laporan</Text>

        {/* FOTO */}
        {foto ? (
          <Image source={{ uri: foto }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: "#888" }}>Tidak ada foto</Text>
          </View>
        )}

        <TouchableOpacity onPress={pilihFoto} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>📷 Ganti Foto</Text>
        </TouchableOpacity>

        {/* INPUT */}
        <TextInput
          style={styles.input}
          value={judul}
          onChangeText={setJudul}
          placeholder="Judul laporan"
        />

        {/* JENIS */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setModalJenis(true)}
        >
          <Text>{jenis || "Pilih jenis laporan"}</Text>
        </TouchableOpacity>

        {/* MODAL JENIS */}
        <Modal transparent visible={modalJenis} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Pilih Jenis</Text>

              {jenisOptions.map((j) => (
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

        {/* STATUS */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setModalStatus(true)}
        >
          <Text>{status}</Text>
        </TouchableOpacity>

        {/* MODAL STATUS */}
        <Modal transparent visible={modalStatus} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Pilih Status</Text>

              {statusOptions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    setStatus(s);
                    setModalStatus(false);
                  }}
                >
                  <Text style={styles.modalItem}>{s}</Text>
                </Pressable>
              ))}

              <Pressable
                style={styles.modalClose}
                onPress={() => setModalStatus(false)}
              >
                <Text style={{ color: "#fff" }}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <TextInput
          style={[styles.input, { height: 100 }]}
          value={deskripsi}
          multiline
          onChangeText={setDeskripsi}
          placeholder="Deskripsi laporan"
        />

        {/* KOORDINAT */}
        <View style={styles.coord}>
          <Text>Latitude: {latitude ?? "-"}</Text>
          <Text>Longitude: {longitude ?? "-"}</Text>
        </View>

        {/* SIMPAN */}
        <TouchableOpacity style={styles.btnSubmit} onPress={simpan}>
          <Text style={styles.btnSubmitText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F2F4F7",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  placeholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  btnSecondary: {
    backgroundColor: "#E8F3FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  btnSecondaryText: {
    color: "#0077B6",
    textAlign: "center",
    fontWeight: "bold",
  },
  coord: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 14,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
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
