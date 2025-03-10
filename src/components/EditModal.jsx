import React, { useState } from "react";

const EditModal = ({ isOpen, onClose, entry, onSave }) => {
  // Initialize state with default values
  const [clockInTime, setClockInTime] = useState(entry?.clockInTime?.toISOString().slice(0, 16) || "");
  const [clockOutTime, setClockOutTime] = useState(entry?.clockOutTime?.toISOString().slice(0, 16) || "");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(clockInTime, clockOutTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Edit Attendance</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Clock In Time</label>
            <input
              type="datetime-local"
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Clock Out Time</label>
            <input
              type="datetime-local"
              value={clockOutTime}
              onChange={(e) => setClockOutTime(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;