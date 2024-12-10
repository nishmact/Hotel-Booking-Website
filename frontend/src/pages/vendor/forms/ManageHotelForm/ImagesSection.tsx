import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { HotelFormData } from "./ManageHotelForm";
import { toast } from "react-toastify";

type ImagesSectionProps = {
  existingImageUrls?: string[];
};

const ImagesSection = ({ existingImageUrls = [] }: ImagesSectionProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<HotelFormData>();

  const [imageUrls, setImageUrls] = useState<string[]>(existingImageUrls);
  const [imageFiles, setImageFiles] = useState<File[]>(watch("imageFiles") || []);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    setValue("imageFiles", imageFiles);
    setValue("imageUrls", imageUrls);
  }, [imageFiles, imageUrls, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const cropImage = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      if (!canvas) {
        toast.error("Failed to crop image. Please try again.");
        return;
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], `cropped-image-${Date.now()}.jpg`, {
            type: blob.type,
          });

          setImageFiles((prevFiles) => {
            const newFiles = [...prevFiles, croppedFile];
            setValue("imageFiles", newFiles); // Sync with form state
            return newFiles;
          });

          setImageUrls((prevUrls) => [...prevUrls, URL.createObjectURL(croppedFile)]);
          setImageSrc(null);
        } else {
          toast.error("Failed to generate cropped image.");
        }
      });
    }
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, imageUrl: string) => {
    event.preventDefault();
    URL.revokeObjectURL(imageUrl);

    // Find the index of the image to delete in imageUrls
    const index = imageUrls.indexOf(imageUrl);
    if (index > -1) {
      // Update imageUrls and imageFiles by filtering out the deleted image
      setImageUrls((prevUrls) => prevUrls.filter((url, i) => i !== index));
      setImageFiles((prevFiles) => {
        const newFiles = prevFiles.filter((_, i) => i !== index);
        setValue("imageFiles", newFiles); // Sync with form state after deletion
        return newFiles;
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className="border rounded p-4 flex flex-col gap-4">
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-6 gap-4">
            {imageUrls.map((url, index) => (
              <div className="relative group" key={url}>
                <img src={url} alt="Uploaded preview" className="min-h-full object-cover" />
                <button
                  onClick={(event) => handleDelete(event, url)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full text-gray-700 font-normal"
          {...register("imageFiles", {
            validate: (imageFiles) => {
              const fileArray = Array.from(imageFiles || []) as File[];
              const totalLength = fileArray.length + imageUrls.length;
              return totalLength <= 6 || "You can only upload up to 6 images.";
            },
          })}
          onChange={handleImageChange}
        />

        {imageSrc && (
          <div className="flex gap-4">
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: 400, width: "100%" }}
              aspectRatio={16 / 9}
              guides={false}
              cropBoxResizable={true}
              cropBoxMovable={true}
            />
            <button
              type="button"
              onClick={cropImage}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Save Cropped Image
            </button>
          </div>
        )}

        {errors.imageFiles && (
          <p className="text-red-500 text-sm mt-2">{errors.imageFiles.message}</p>
        )}
      </div>
    </div>
  );
};

export default ImagesSection;
