import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Layout/Navbar';

const CheckoutPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); 

  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    address: '' 
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await API.get(`/services/${serviceId}`);
        setService(res.data.service);
      } catch (err) {
        console.error("Error loading service:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const handleBookingConfirm = async () => {
    if (!bookingDetails.date || !bookingDetails.time) {
      alert("Please select date and time");
      return;
    }
    try {
      const res = await API.post('/bookings/create', {
        providerId: service.provider._id,
        serviceType: service.title,
        date: bookingDetails.date,
        time: bookingDetails.time,
        price: service.price
      });

      if (res.data.success) {
        setStep(3); 
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      alert("Booking failed. Server error.");
    }
  };

  const styles = {
    page: { backgroundColor: '#f1f3f6', minHeight: '100vh', color: '#212121' },
    main: { maxWidth: '1000px', margin: '20px auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' },
    card: { backgroundColor: 'white', padding: '20px', marginBottom: '10px', boxShadow: '0 1px 2px 0 rgba(0,0,0,.1)' },
    header: { backgroundColor: '#2874f0', color: 'white', padding: '12px 20px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' },
    orangeBtn: { backgroundColor: '#fb641b', color: 'white', border: 'none', padding: '15px 30px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px', width: '100%' },
    input: { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '4px' },
    profileLink: { color: '#2874f0', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Flipkart is loading...</div>;

  if (step === 3) return (
    <div style={{textAlign: 'center', padding: '100px', backgroundColor: 'white', height: '100vh'}}>
      <h1 style={{color: '#388e3c', fontSize: '3rem'}}>✔️</h1>
      <h2>Booking Placed Successfully!</h2>
      <p>Redirecting you to dashboard...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.main}>
        
        {/* Left Side: Checkout Steps */}
        <div>
          {/* Step 1: Service Info */}
          <div style={styles.card}>
            <div style={styles.header}>1. ITEM DETAILS</div>
            <div style={{display: 'flex', padding: '20px', gap: '20px'}}>
              <div style={{width: '100px', height: '100px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden'}}>
                {service.image ? <img src={service.image} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : "🛠️"}
              </div>
              <div>
                <h3 style={{margin:0}}>{service.title}</h3>
                <p style={{color: '#878787', margin: '5px 0'}}>Category: {service.category}</p>
                <h2 style={{margin:0}}>₹{service.price}</h2>
              </div>
            </div>
          </div>

          {/* NEW: Provider Profile Section */}
          <div style={styles.card}>
            <div style={{...styles.header, backgroundColor: '#f5f7fa', color: '#212121', borderBottom: '1px solid #eee'}}>
              <span>ABOUT THE PROFESSIONAL</span>
            </div>
            <div style={{padding: '20px', display: 'flex', alignItems: 'center', gap: '15px'}}>
              <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2874f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
                {service.provider?.name?.charAt(0)}
              </div>
              <div>
                <h4 style={{margin: 0}}>{service.provider?.name}</h4>
                <p style={{margin: '2px 0', fontSize: '0.85rem', color: '#666'}}>Highly rated expert in {service.category}</p>
                <button 
                  style={{...styles.profileLink, background: 'none', border: 'none', padding: 0}}
                  onClick={() => navigate(`/provider/${service.provider._id}`)}
                >
                  VIEW FULL PROFILE & PORTFOLIO →
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Schedule */}
          <div style={styles.card}>
            <div style={styles.header}>2. SERVICE SCHEDULE</div>
            <div style={{padding: '20px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                   <label style={{fontSize: '0.8rem', color: '#878787'}}>Preferred Date</label>
                   <input type="date" style={styles.input} onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} />
                </div>
                <div>
                   <label style={{fontSize: '0.8rem', color: '#878787'}}>Preferred Time</label>
                   <input type="time" style={styles.input} onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})} />
                </div>
              </div>
              {step === 1 && <button style={styles.orangeBtn} onClick={() => setStep(2)}>CONTINUE TO PAYMENT</button>}
            </div>
          </div>

          {/* Step 3: Payment */}
          <div style={styles.card}>
            <div style={styles.header}>3. PAYMENT OPTIONS</div>
            {step === 2 && (
              <div style={{padding: '20px'}}>
                <div style={{border: '1px solid #2874f0', padding: '15px', borderRadius: '4px', marginBottom: '20px', backgroundColor: '#f5faff'}}>
                  <input type="radio" checked readOnly /> <span style={{marginLeft: '10px', fontWeight: 'bold'}}>Dummy UPI Payment</span>
                </div>
                <button style={styles.orangeBtn} onClick={handleBookingConfirm}>CONFIRM BOOKING</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Price Summary */}
        <div style={{...styles.card, height: 'fit-content', position: 'sticky', top: '20px'}}>
          <h4 style={{color: '#878787', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginTop: 0}}>PRICE DETAILS</h4>
          <div style={{display: 'flex', justifyContent: 'space-between', margin: '15px 0'}}>
            <span>Price (1 Item)</span>
            <span>₹{service.price}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', margin: '15px 0'}}>
            <span>Delivery/Service Fee</span>
            <span style={{color: '#388e3c'}}>FREE</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e0e0e0', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '20px'}}>
            <span>Total Amount</span>
            <span>₹{service.price}</span>
          </div>
          <div style={{backgroundColor: '#f5faff', padding: '10px', marginTop: '20px', border: '1px solid #e0e0e0', borderRadius: '4px'}}>
             <p style={{margin: 0, fontSize: '0.85rem', color: '#388e3c', fontWeight: 'bold'}}>✓ Trusted Professional</p>
             <p style={{margin: 0, fontSize: '0.85rem', color: '#388e3c', fontWeight: 'bold'}}>✓ 100% Secure Transaction</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;