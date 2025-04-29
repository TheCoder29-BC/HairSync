import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const [firstName, setFirstName] = useState('Max');
  const [lastName, setLastName] = useState('Mustermann');
  const [phone, setPhone] = useState('0151 12345678');
  const [address, setAddress] = useState('Musterstraße 1, 12345 Berlin');
  const [email, setEmail] = useState('max@example.com');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success('Profil erfolgreich gespeichert ✅', {
        style: { background: '#4f46e5', color: '#fff' },
      });
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <Toaster position="top-center" />
      <div className={styles.card}>
        <h1 className={styles.title}>Mein Profil</h1>

        {/* Profilbild */}
        <div className={styles.profileImageContainer}>
          {profileImage ? (
            <img src={profileImage} alt="Profil" className={styles.profileImage} />
          ) : (
            <div className={styles.profilePlaceholder}>Bild hochladen</div>
          )}
          <input type="file" onChange={handleImageUpload} className={styles.uploadInput} />
        </div>

        {/* Formular */}
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Vorname</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Nachname</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Telefonnummer</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <div className={styles.dots}>
                <div></div><div></div><div></div>
              </div>
            ) : (
              'Speichern'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
