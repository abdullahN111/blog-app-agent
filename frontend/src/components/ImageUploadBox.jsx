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
        <div className="relative overflow-hidden border border-[#111110] bg-[#FAF8F5] h-44">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-[#111110] text-[#FAF8F5] flex items-center justify-center hover:bg-[#C83E2B] transition-colors cursor-pointer"
            aria-label="Clear image"
          >
            <FiX size={15} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center h-44 border border-dashed border-[#111110] bg-[#FAF8F5] cursor-pointer hover:bg-[#F3EFEA] transition-colors group"
        >
          <FiUpload
            className="text-[#57544E] group-hover:text-[#C83E2B] mb-2.5 transition-colors"
            size={20}
          />
          <span className="text-xs font-mono-meta uppercase tracking-wider text-[#111110] font-medium">
            Select Visual Plate
          </span>
          <span className="text-[11px] font-mono-meta text-[#85817A] mt-1">
            PNG or JPG — Max 5MB
          </span>
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
