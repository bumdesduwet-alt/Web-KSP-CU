# Spesifikasi Keamanan Firestore — KSP CU Argomanunggal Santosa

## 1. Data Invariants
1. Tidak ada informasi keuangan pribadi anggota (saldo, riwayat simpanan, riwayat pinjaman) di Firestore.
2. Seluruh data PII publik yang masuk (`joinInquiries`, `contactMessages`, `memberProductSubmissions`) HANYA dapat dibaca, diperbarui, atau dihapus oleh administrator terverifikasi (`isAdmin()`).
3. Koleksi `newsComments` wajib berstatus `'pending'` dengan `boardReply == ''` saat dibuat oleh publik, dan query publik (`get` & `list`) HANYA dapat membaca komentar berstatus `'approved'`.
4. Koleksi `memberProducts` pada query publik (`get` & `list`) HANYA menampilkan produk berstatus `'approved'`.
5. Koleksi `newsArticles`, `cooperativeProducts`, `galleryItems`, dan `testimonials` pada query publik HANYA menampilkan item dengan `isPublished == true`.
6. Role admin (`isAdmin()`) mewajibkan `request.auth != null && request.auth.token.email_verified == true` serta kecocokan email bootstrap (`bumdesduwet@gmail.com`) atau eksistensi dokumen di `/admins/$(request.auth.uid)`.

## 2. "Dirty Dozen" Adversarial Payloads (Harus Menghasilkan PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: Pengguna login dengan email admin namun `email_verified: false` mencoba menulis ke `/siteSettings/main`. -> **DENIED**.
2. **Public Read of PII (`joinInquiries`)**: Pengunjung anonim atau non-admin mencoba `get`/`list` `/joinInquiries`. -> **DENIED**.
3. **Public Read of PII (`contactMessages`)**: Pengunjung mencoba membaca `/contactMessages`. -> **DENIED**.
4. **Public Read of Pending Comments**: Pengunjung melakukan query `newsComments` tanpa filter `where('status', '==', 'approved')`. -> **DENIED**.
5. **Comment Auto-Approve Injection**: Pengunjung membuat dokumen di `newsComments` dengan `status: 'approved'` atau `boardReply: 'Disetujui'`. -> **DENIED**.
6. **Comment XSS Payload**: Pengunjung mengirim komentar berisi `<script>alert(1)</script>`. -> **DENIED** oleh regex `^[^<>]+$`.
7. **Orphan Comment Injection**: Pengunjung mengirim komentar dengan `articleId` yang tidak ada di `/newsArticles`. -> **DENIED** oleh `exists(...)`.
8. **Shadow Field Injection**: Pengunjung menambahkan field tambahan `isAdmin: true` pada dokumen `joinInquiries`. -> **DENIED** oleh `keys().hasOnly(...)`.
9. **ID Poisoning**: Penulis mengirim ID dokumen sepanjang >128 karakter atau berisi karakter ilegal `/../`. -> **DENIED** oleh `isValidId(...)`.
10. **Non-Admin Product Publish**: Pengunjung non-admin mencoba menulis langsung ke `/memberProducts`. -> **DENIED**.
11. **Timestamp Forgery**: Pengunjung mengirim `createdAt` masa lalu/depan pada `contactMessages` selain `request.time`. -> **DENIED**.
12. **Privilege Escalation on `/admins`**: Pengguna terautentikasi non-admin mencoba membuat dokumen dirinya di `/admins/{uid}`. -> **DENIED**.
