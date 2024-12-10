import './form.css';
import React, { useState, useEffect } from "react";

// Initialize IndexedDB
const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FormDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("FormData")) {
        db.createObjectStore("FormData", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Add Data to IndexedDB
const addDataToDB = async (db, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("FormData", "readwrite");
    const store = transaction.objectStore("FormData");
    const request = store.add(data);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

// Fetch Data from IndexedDB
const fetchDataFromDB = async (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("FormData", "readonly");
    const store = transaction.objectStore("FormData");
    const request = store.getAll();

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Delete Data from IndexedDB
const deleteDataFromDB = async (db, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("FormData", "readwrite");
    const store = transaction.objectStore("FormData");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

function Form() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: ""
  });

  const [inputArr, setInputArr] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const loadRecords = async () => {
      const db = await initDB();
      const storedData = await fetchDataFromDB(db);
      setInputArr(storedData);
    };

    loadRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = await initDB();

    if (editing) {
      // Update data
      const transaction = db.transaction("FormData", "readwrite");
      const store = transaction.objectStore("FormData");
      store.put({ ...formData, id: editing });
    } else {
      // Add new data
      await addDataToDB(db, formData);
    }

    const updatedData = await fetchDataFromDB(db);
    setInputArr(updatedData);
    setFormData({ name: "", email: "", age: "" });
    setEditing(null);
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData({
      name: item.name,
      email: item.email,
      age: item.age
    });
  };

  const handleDelete = async (id) => {
    const db = await initDB();
    await deleteDataFromDB(db, id);
    const updatedData = await fetchDataFromDB(db);
    setInputArr(updatedData);
  };

  return (
    <div className='formbody'>
      <div className='f1'>
        <h2 className='h'>User Details</h2>
        <form onSubmit={handleSubmit}>
          <div className='b1'>
            <label htmlFor="name">Name: </label>
            <input
              className='field'
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className='b1'>
            <label htmlFor="email">Email: </label>
            <input
              className='field'
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='b1'>
            <label htmlFor="age">Age: </label>
            <input
              className='field'
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              required
              style={{ marginLeft: '10px' }}
            />
          </div>

          <button type="submit" className='bt'>
            {editing ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      <div className='tablebody'>
        <table className='tb1'>
          <thead className='tablehead'>
            <tr>
              <th className='td' id='td1'>Code</th>
              <th className='td' id='td1'>Category Name</th>
              <th className='td' id='td1'>Category Code</th>
              <th className='td' id='td1'>Age</th>
              <th className='td' id='td1'>Action</th>
            </tr>
          </thead>
          <tbody>
            {inputArr.map((info) => (
              <tr key={info.id}>
                <td className='td'>{info.id}</td>
                <td className='td'>{info.name}</td>
                <td className='td'>{info.email}</td>
                <td className='td'>{info.age}</td>
                <td className='td'>
                  <button onClick={() => handleEdit(info)} className='ac1'>Edit</button>
                  <button onClick={() => handleDelete(info.id)} className='ac2'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Form;
