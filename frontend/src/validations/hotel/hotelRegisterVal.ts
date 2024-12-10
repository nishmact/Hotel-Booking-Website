interface HotelValidationErrors {
    name: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    country: string;
    confirm_password?: string;
    logoUrl?: string;
  }
  
  interface HotelValidationValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    country: string;
    confirm_password?: string;
    logoUrl?: string;
  }
  
  export const validateHotel = (values: HotelValidationValues): HotelValidationErrors => {
    const errors: HotelValidationErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      city: "",
      country: "",
      confirm_password: "",
      logoUrl: ""
    };
  
    // Validate name
    if (!values.name.trim()) {
      errors.name = 'Hotel name is required';
    } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
      errors.name = 'Hotel name should not contain numbers';
    }
  
    // Validate email
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
  
    // Validate phone
    if (!values.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (values.phone.length !== 10) {
      errors.phone = 'Phone number should contain 10 characters';
    }
  
    // Validate password
    if (!values.password.trim()) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password should contain at least 6 characters';
    }
  
    // Validate confirm password (if applicable)
    if (values.confirm_password !== undefined) {
      if (!values.confirm_password.trim()) {
        errors.confirm_password = 'Confirm Password is required';
      } else if (values.confirm_password !== values.password) {
        errors.confirm_password = 'Password should match';
      }
    }
  
    // Validate city
    if (!values.city.trim()) {
      errors.city = 'City is required';
    }
  
    // Validate country
    if (!values.country.trim()) {
      errors.country = 'Country is required';
    }
  
    // Validate logo URL (if applicable)
    if (values.logoUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(values.logoUrl)) {
      errors.logoUrl = 'Invalid logo URL';
    }
  
    return errors;
  };
  