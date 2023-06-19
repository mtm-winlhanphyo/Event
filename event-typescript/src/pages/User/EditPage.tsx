import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderPage from '../../components/Header/HeaderPage';

const EditPage: React.FC = () => {
  interface FormData {
    name: string,
    email: string,
    phone: string,
    profile: string,
    role: string,
    address: string,
    dob: string
  }
  const initialFormData: FormData = {
    name: '',
    email: '',
    phone: '',
    profile: '',
    role: '',
    address: '',
    dob: ''
  };
  const [errors, setErrors]  = useState<{[key: string]: string}>({
    name: '',
    email: '',
    phone: '',
    profile: '',
    role: '',
    address: '',
    dob: ''
  });

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [previewImage, setPreviewImage] = useState<string | ArrayBuffer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {id} = useParams();

  /**
   * To get the selected ID
   */
  React.useEffect(() => {
    axios.get(`http://localhost:8000/api/user/detail/${id}`).then((response) => {
      if (response.status === 200) {
        setFormData({...response.data});
      }
    })
  }, []);

  /**
   * validation errorr message for input fields
   * @returns 
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}; 
    const  requiredFields:string[] = [formData.name, formData.phone, formData.profile, formData.role, formData.address, formData.dob];
    const errorMessages: string[] = ['name', 'phone', 'profile', 'role', 'address', 'dob']; 
    for(let i=0; i<requiredFields.length; i++){
      if(requiredFields[i] === ''){
        for(let j=0; j<errorMessages.length; j++){
          if( i === j) {
            newErrors[errorMessages[j]] = `${errorMessages[j].charAt(0).toUpperCase() + errorMessages[j].slice(1)} is required.`;
          }
        }
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(formData.email)) {
      newErrors.email = "Email is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /**
   * handle file change event for the profile image
   * @param event 
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  }

  /**
   * handle clear event for input fields
   */
  const handleClear = () => {
    setPreviewImage(null);
    setFormData(initialFormData);
  };

  /**
 * input field value changes
 */
  const inputChangeForUser = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const file = event.target;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  /**
   * User Update form
   * @param e
   */
  const editFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if(isFormValid && formData) {
      axios.post(`http://localhost:8000/api/user/update/${id}`, formData).then((response) => {
        if (response.status === 200) {
          window.location.href = '/admin/users';
        }
      }).catch(error => {
        console.log(error);
      });
    }
  };

  const styles = {    
    edit: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '34px',
        backgroundColor: '#4e7294',
    },
    editBox: {
        marginTop: '1rem',
        width: '450px',
        background: '#8ab1d682',
        color: '#cce6ff',
        borderRadius: '8px',
    },
    editHeader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize:' xx-large',
        fontWeight: 'bolder',
        marginTop: '30px',
    },
    input: {
        padding: '20px 0 30px 0',
        margin: "0 auto",
        width: "90%",
    }, 
    inputStyle: {
        border: 'none',
        borderRadius: '5px',
        padding: '10px',
        width: '95%',
        display: 'block',
        marginBottom: "5px",
        marginTop: "30px",
    },
    radioImageStyle: {
        border: 'none',
        borderRadius: '5px',
        width: '95%',
        display: 'block',
        marginBottom: "5px",
        marginTop: "30px",
    }, 
    submitButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      fontSize: "14px",
      background: '#32dc32b0',
      color: '#fff',
      cursor: 'pointer',
    },
    clearbutton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      fontSize: "14px",
      background: '#d41616',
      color: '#fff',
      cursor: 'pointer',
    },
    previewImage: {
      with: "90px",
      height: "90px"
    },
      errorMessage: {
        display: "block",
        fontSize: "14px",
        color: "#b41616",
      }
  }

  return (
    <div>
      <HeaderPage />
      <form style={styles.edit} onSubmit={editFormSubmit}> 
        <div style={styles.editBox}>
        <div style={styles.editHeader}>Edit User</div>
        <div style={styles.input}>
          <input 
            style={styles.inputStyle} 
            placeholder="Enter your name" 
            name="name" 
            type="name"
            value={formData?.name}
            onChange={inputChangeForUser}
          />
          {errors.name && <span style={styles.errorMessage}>{errors.name}</span>}
          <div style={styles.radioImageStyle}>
            <label>
              <input
                type="radio"
                name="role"
                value="1"
                checked={formData?.role.toString() === '1'}
                onChange={inputChangeForUser}
              />
              Admin
            </label>
            <label>
              <input
                name="role"
                type="radio"
                value="0"
                checked={formData?.role.toString() === '0'}
                onChange={inputChangeForUser}
              />
              User
            </label>
          </div>
          {errors.role && <span style={styles.errorMessage}>{errors.role}</span>}
          <input
            style={styles.inputStyle} 
            placeholder="Enter your email" 
            name="email" 
            type="email"
            value={formData?.email}
            onChange={inputChangeForUser}
          />
          {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
          <input
            style={styles.inputStyle}
            placeholder="Enter your address"
            name="address"
            type="address"
            value={formData?.address}
            onChange={inputChangeForUser}
          />
          {errors.address && <span style={styles.errorMessage}>{errors.address}</span>}
          <input
            style={styles.inputStyle}
            placeholder="Enter your Date of Birth"
            name="dob"
            type="date"
            value={formData?.dob}
            onChange={inputChangeForUser}
          />
          {errors.dob && <span style={styles.errorMessage}>{errors.dob}</span>}
          <div style={styles.radioImageStyle}>
            { 
              previewImage && 
              <img 
                src={previewImage.toString()} 
                style={styles.previewImage} 
                alt="profile"
              />
            }
            {
                !previewImage && 
                <img
                  src={
                    "http://localhost:8000/" +
                    formData.profile +
                    "?auto=format&fit=crop&w=800"
                  }
                  srcSet={
                    "http://localhost:8000/" +
                    formData.profile +
                    "?auto=format&fit=crop&w=800&dpr=2 2x"
                  }
                  alt={formData.name}
                  loading="lazy"
                  style={styles.previewImage}
                />
            }
            <input
              type="file"
              name="profile"
              onChange={handleFileChange}
            />
          </div>
          {errors.profile && <span style={styles.errorMessage}>{errors.profile}</span>}
          <input
            style={styles.inputStyle}
            placeholder="Enter your phone number"
            name="phone"
            type="tel"
            value={formData?.phone}
            onChange={inputChangeForUser}
          />
          {errors.phone && <span style={styles.errorMessage}>{errors.phone}</span>}
        </div>
        <div style={{display: "flex", justifyContent: "space-evenly", marginBottom: "20px"}}>
          <button type="reset" style={styles.clearbutton} onClick={handleClear}>Clear</button>
          <button style={styles.submitButton} type="submit">Update User</button>
        </div>
        </div>
      </form>
    </div>
  )
}  

export default EditPage;