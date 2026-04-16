import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Camera, Loader2 } from 'lucide-react';

const UpdateProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);

  // Profile picture preview logic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (profilePic) {
        data.append('avatar', profilePic); // Backend pe multer/cloudinary setup hona chahiye
      }

      const res = await API.put('/auth/update-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        // Global state aur localStorage update karo
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        alert("Profile Updated Successfully! 🚀");
        navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', color: 'white' },
    container: { maxWidth: '600px', margin: '0 auto', padding: '60px 20px' },
    card: { backgroundColor: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1f2937', position: 'relative' },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    imgContainer: { position: 'relative', width: '120px', height: '120px', borderRadius: '50%', border: '2px solid #6366f1', overflow: 'hidden', backgroundColor: '#1e293b' },
    cameraIcon: { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#6366f1', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #111827' },
    label: { display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' },
    inputGroup: { position: 'relative', marginBottom: '20px' },
    icon: { position: 'absolute', left: '15px', top: '13px', color: '#64748b' },
    input: { width: '100%', padding: '12px 15px 12px 45px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Update Profile</h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px' }}>Keep your info up to date</p>

          <form onSubmit={handleSubmit}>
            {/* Profile Picture Upload */}
            <div style={styles.avatarSection}>
              <div style={styles.imgContainer}>
                {preview ? (
                  <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} style={{ marginTop: '25px', opacity: 0.2 }} />
                )}
              </div>
              <label htmlFor="avatar-upload" style={styles.cameraIcon}>
                <Camera size={18} color="white" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
              />
            </div>

            {/* Name Input */}
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputGroup}>
              <User style={styles.icon} size={20} />
              <input 
                style={styles.input} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your Name"
              />
            </div>

            {/* Email Input (Read Only usually) */}
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputGroup}>
              <Mail style={styles.icon} size={20} />
              <input 
                style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }} 
                value={formData.email} 
                readOnly
              />
            </div>

            <button 
              type="submit" 
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </button>

            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #374151', marginTop: '12px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;