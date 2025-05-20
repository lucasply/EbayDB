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

export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    upc: '',
    quantity: '',
    date: ''
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        upc: product.upc || '',
        quantity: product.quantity || 0,
        date: product.bought_at ? product.bought_at.split('T')[0] : '2000-01-01'
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(product.id, form);
  };

  if (!product) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>Edit Product</div>

        <div style={styles.field}>
          <label>Name:</label>
          <input style={styles.input} name="name" value={form.name} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Quantity:</label>
          <input style={styles.input} name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Date Purchased:</label>
          <input style={styles.input} name="date" type="date" value={form.date} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Price:</label>
          <input style={styles.input} name="price" type="number" value={form.price} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label>Description:</label>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <label>UPC:</label>
          <input style={styles.input} name="upc" value={form.upc} onChange={handleChange} />
        </div>

        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={handleSubmit}>Save</button>
          <button style={styles.button} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
