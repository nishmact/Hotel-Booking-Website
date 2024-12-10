import { useState } from "react";
import { validate } from "../../validations/user/contactVal";
import { axiosInstance } from "../../config/api/axiosinstance";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface UserFormValues {
  email: string;
  name: string;
  mobile: string;
  subject: string;
  message: string;
}

const initialValues: UserFormValues = {
  email: "",
  name: "",
  mobile: "",
  subject: "",
  message: "",
};

const ContactForm = () => {
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      setIsSubmitting(true);
      axiosInstance
        .post(`${BASE_URL}/api/user/send-message`, formValues, { withCredentials: true })
        .then((response) => {
          if (response.data) {
            toast.success("Email sent successfully!");
            setFormValues(initialValues);
          }
        })
        .catch((error) => {
          toast.error(error.response?.data.message || "An error occurred");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  return (
    <div className="md:w-1/2 lg:w-2/3 lg:pl-4">
      <form className="shadow-none rounded px-8 pt-6 pb-8 mb-4" onSubmit={submitHandler}>
        <div className="mb-4 flex flex-wrap">
          <div className="w-full md:w-1/2 lg:pr-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              name="name"
              value={formValues.name}
              onChange={handleChange}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
          <div className="w-full md:w-1/2 lg:pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              name="email"
              value={formValues.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap">
          <div className="w-full md:w-1/2 pr-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
              Mobile
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              name="mobile"
              value={formValues.mobile}
              onChange={handleChange}
            />
            {formErrors.mobile && (
              <p className="text-sm text-red-500">{formErrors.mobile}</p>
            )}
          </div>
          <div className="w-full md:w-1/2 lg:pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              name="subject"
              value={formValues.subject}
              onChange={handleChange}
            />
            {formErrors.subject && (
              <p className="text-sm text-red-500">{formErrors.subject}</p>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            name="message"
            value={formValues.message}
            onChange={handleChange}
          />
          {formErrors.message && (
            <p className="text-sm text-red-500">{formErrors.message}</p>
          )}
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isSubmitting ? (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
