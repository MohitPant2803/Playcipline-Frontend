import React from 'react';
import Modal from './Modal';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SIGN OUT?">
      <div className="space-y-5">
        <p className="text-slate-300">
          Are you sure you want to logout of Playcipline?
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 shadow-lg shadow-red-600/30"
          >
            Logout
          </button>
        </div>
      </div>
    </Modal>
  );
}
