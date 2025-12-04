import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* Enable LayoutAnimation on Android */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DaruratScreen() {
  const [open, setOpen] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    LayoutAnimation.easeInEaseOut();
    setOpen(open === key ? null : key);
  };

  const callNumber = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Informasi Darurat</Text>
      <Text style={styles.subheader}>
        Gunakan tombol-tombol di bawah ini untuk menghubungi layanan darurat.
      </Text>

      {/* GRID DARURAT */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#d62828" }]}
          onPress={() => callNumber("110")}
        >
          <Ionicons name="shield" size={40} color="white" />
          <Text style={styles.cardTitle}>Polisi</Text>
          <Text style={styles.cardNum}>110</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#1d3557" }]}
          onPress={() => callNumber("118")}
        >
          <Ionicons name="medkit" size={40} color="white" />
          <Text style={styles.cardTitle}>Ambulans</Text>
          <Text style={styles.cardNum}>118</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#e76f51" }]}
          onPress={() => callNumber("113")}
        >
          <Ionicons name="flame" size={40} color="white" />
          <Text style={styles.cardTitle}>Pemadam</Text>
          <Text style={styles.cardNum}>113</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#2a9d8f" }]}
          onPress={() => callNumber("112")}
        >
          <Ionicons name="warning" size={40} color="white" />
          <Text style={styles.cardTitle}>Darurat Umum</Text>
          <Text style={styles.cardNum}>112</Text>
        </TouchableOpacity>
      </View>

      {/* P3K */}
      <Text style={styles.sectionTitle}>Panduan Pertolongan Pertama (P3K)</Text>

      <View style={styles.accordionBox}>
        {/* Item 1 */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleAccordion("pendarahan")}
        >
          <Text style={styles.accordionTitle}>Penanganan Pendarahan</Text>
          <Ionicons
            name={open === "pendarahan" ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {open === "pendarahan" && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionText}>• Tekan area luka dengan kain bersih.</Text>
            <Text style={styles.accordionText}>• Angkat bagian yang terluka untuk kurangi aliran darah.</Text>
            <Text style={styles.accordionText}>• Jangan melepas kain jika sudah penuh darah, tambah lapisan baru.</Text>
          </View>
        )}

        {/* Item 2 */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleAccordion("kecelakaan")}
        >
          <Text style={styles.accordionTitle}>Mengamankan Lokasi Kecelakaan</Text>
          <Ionicons
            name={open === "kecelakaan" ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {open === "kecelakaan" && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionText}>• Pastikan lokasi aman dari kendaraan lain.</Text>
            <Text style={styles.accordionText}>• Jangan memindahkan korban jika bukan profesional.</Text>
            <Text style={styles.accordionText}>• Hubungi layanan darurat segera.</Text>
          </View>
        )}

        {/* Item 3 */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleAccordion("pingsan")}
        >
          <Text style={styles.accordionTitle}>Penanganan Orang Pingsan</Text>
          <Ionicons
            name={open === "pingsan" ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {open === "pingsan" && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionText}>• Baringkan korban dan longgarkan pakaian.</Text>
            <Text style={styles.accordionText}>• Angkat kaki korban sedikit lebih tinggi.</Text>
            <Text style={styles.accordionText}>• Pastikan ruang memiliki udara segar.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fafafa",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: "#444",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginTop: 8,
  },
  cardNum: {
    fontSize: 14,
    color: "white",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  accordionBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  accordionContent: {
    paddingVertical: 8,
    paddingLeft: 4,
    marginBottom: 10,
  },
  accordionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
});
