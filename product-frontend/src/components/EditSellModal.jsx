import React, { useState, useEffect } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'black',
    padding: '2rem',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    marginTop: '0.25rem',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1.25rem',
    fontSize: '1rem',
    cursor: 'pointer',
  }
};

export default function EditSellModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    PurchaseDate: '',
    SoldDate: '',
    PurchasePrice: '',
    SoldPrice: '',
    quantity: '',
  });

  useEffect(() => {
    if (product) {
        setForm({
        name: product.name || '',
        PurchaseDate: product.purchase_date ? product.purchase_date.split('T')[0] : '2000-01-01',
        SoldDate: product.sold_at ? product.sold_at.split('T')[0] : '2000-01-01',
        PurchasePrice: product.purchased_price || '',
        SoldPrice: product.sold_price || '',
        quantity: product.quantity || 0,
        });
    }
    }, [product]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(product, form);
  };

  if (!product) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>Edit Sale</div>

        <div style={styles.field}>
          <label>Name:</label>
          <input style={styles.input} name="name" type="text" value={form.name} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Date Purchased:</label>
          <input style={styles.input} name="PurchaseDate" type="date" value={form.PurchaseDate} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Date Sold:</label>
          <input style={styles.input} name="SoldDate" type="date" value={form.SoldDate} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Purchase Price:</label>
          <input style={styles.input} name="PurchasePrice" type="number" value={form.PurchasePrice} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label>Sold Price:</label>
          <input style={styles.input} name="SoldPrice" type="number" value={form.SoldPrice} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Quantity:</label>
          <input style={styles.input} name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        </div>

        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={handleSubmit}>Save</button>
          <button style={styles.button} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
