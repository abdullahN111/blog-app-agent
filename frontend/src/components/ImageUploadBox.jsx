"use client";

import { FiX, FiUpload } from "react-icons/fi";

export default function ImageUploadBox({
  inputRef,
  name,
  preview,
  onChange,
  onClear,
}) {
  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-middle hover:bg-middle/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-middle/10 flex items-center justify-center mb-2 transition-colors">
            <FiUpload
              className="text-gray-400 group-hover:text-middle transition-colors"
              size={18}
            />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-middle transition-colors">
            Click to upload
          </span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        id={name}
        name={name}
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
