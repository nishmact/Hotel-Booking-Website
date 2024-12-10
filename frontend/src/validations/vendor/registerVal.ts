interface ValidationErrors {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  pricePerNight: string;
  type: string;
  password: string;
  adultCount: string;
  childCount: string;
  confirm_password: string;
  imageUrls: string;
}

interface ValidationValues {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  password: string;
  pricePerNight: string;
  type: string;
  adultCount: string;
  childCount: string;
  confirm_password: string;
  imageUrls: string;
}

export const validate = (values: ValidationValues): ValidationErrors => {
  const errors: ValidationErrors = {
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    description: "",
    pricePerNight: "",
    type: "",
    password: "",
    adultCount: "",
    childCount: "",
    confirm_password: "",
    imageUrls: "",
  };

  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
    errors.name = "Should not contain numbers!";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  if (!values.city.trim()) {
    errors.city = "City is required";
  } else if (!/^[A-Za-z\s]+$/i.test(values.city)) {
    errors.city = "Should not contain numbers!";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone is required";
  } else if (!/^[0-9]+$/u.test(values.phone)) {
    errors.phone = "Should not include characters";
  } else if (values.phone.length !== 10) {
    errors.phone = "Should contain 10 numbers";
  }

  if (!values.password.trim()) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Contain at least 6 characters";
  }

  if (!values.confirm_password.trim()) {
    errors.confirm_password = "Confirm Password is required";
  } else if (values.confirm_password !== values.password) {
    errors.confirm_password = "Password should match!";
  }

  if (!values.country.trim()) {
    errors.country = "Country is required";
  } else if (!/^[A-Za-z\s]+$/i.test(values.country)) {
    errors.country = "Should not contain numbers!";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required";
  } else if (values.description.length < 10) {
    errors.description = "Description should be at least 10 characters long";
  }

  if (!values.pricePerNight.trim()) {
    errors.pricePerNight = "Price per night is required";
  } else if (isNaN(Number(values.pricePerNight))) {
    errors.pricePerNight = "Price must be a valid number";
  } else if (Number(values.pricePerNight) <= 0) {
    errors.pricePerNight = "Price must be greater than 0";
  }

  if (!values.type.trim()) {
    errors.type = "Type is required";
  }

  if (!values.adultCount.trim()) {
    errors.adultCount = "Number of adults is required";
  } else if (!/^[0-9]+$/.test(values.adultCount)) {
    errors.adultCount = "Should be a valid number";
  } else if (Number(values.adultCount) <= 0) {
    errors.adultCount = "Number of adults must be greater than 0";
  }

  if (!values.childCount.trim()) {
    errors.childCount = "Number of children is required";
  } else if (!/^[0-9]+$/.test(values.childCount)) {
    errors.childCount = "Should be a valid number";
  } else if (Number(values.childCount) < 0) {
    errors.childCount = "Number of children cannot be negative";
  }

  if (values.imageUrls.trim() === "") {
    errors.imageUrls = "At least one image URL is required";
  } else {
    const imageArray = values.imageUrls.split(",");
    if (imageArray.length < 1) {
      errors.imageUrls = "At least one image URL is required";
    }
  }
  
  return errors;

}
