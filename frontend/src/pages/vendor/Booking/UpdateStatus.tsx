import React, { useState } from 'react';
import { axiosInstanceVendor } from '../../../config/api/axiosinstance';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface UpdateStatusProps {
  bookingId: string | undefined;
  onStatusChange: (newStatus: string) => void;
}

const UpdateStatus: React.FC<UpdateStatusProps> = ({ bookingId, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>('');
  const [errorStatus, setErrorStatus] = useState<string>('');
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (!selectedStatus) {
      setErrorStatus('Please select a status');
      return;
    }
    setOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior

    axiosInstanceVendor
      .put(
        `${BASE_URL}/api/vendor/update-booking-status?bookingId=${bookingId}`,
        { status: selectedStatus },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response.data);
        setOpen(false);
        toast.success("Status Changed Successfully!");
        onStatusChange(selectedStatus || '');
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  };

  return (
    <>
      <div className="max-w-xs mt-6 p-4 border rounded-lg shadow-md bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Change Status</h2>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setErrorStatus('');
          }}
          className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
        >
          <option value="">Select status</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
        {errorStatus && <p className="text-red-500">{errorStatus}</p>}
        <button
          onClick={handleOpen}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Update
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm">
            <h3 className="text-lg font-semibold">Update Status</h3>
            <p className="mb-4 mt-2">Are you sure you want to update the status?</p>
            <form onSubmit={handleUpdate}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mr-6 text-red-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              >
                Change
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateStatus;
