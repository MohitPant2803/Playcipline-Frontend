import React from 'react';
import Modal from './Modal';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Logout?">
      <div className="space-y-5">
        <p className="text-gray-600">
          Are you sure you want to logout of Playcipline?
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </Modal>
  );
}
