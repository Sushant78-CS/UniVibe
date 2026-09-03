package com.example.NotesRoom.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadProfileImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile image is required");
        }

        // Validate file type
        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        // Upload to Cloudinary
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "univibe/profile-images",
                        "resource_type", "image"
                )
        );

        return result.get("secure_url").toString();
    }

    public void deleteProfileImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        String publicId = extractPublicId(imageUrl);
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap(
                        "resource_type",
                        "image"
                )
        );
    }

    public String uploadPostImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Post image is required");
        }
        String contentType = file.getContentType();
        if (contentType == null ||
                !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "univibe/post-images",
                        "resource_type", "image"
                )
        );
        return result.get("secure_url").toString();
    }

    public void deletePostImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        String publicId = extractPublicId(imageUrl);
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap(
                        "resource_type", "image"
                )
        );
    }

    private String extractPublicId(String imageUrl) {
        String uploadMarker = "/upload/";
        int uploadIndex = imageUrl.indexOf(uploadMarker);
        if (uploadIndex == -1) {
            return null;
        }
        String publicId = imageUrl.substring(uploadIndex + uploadMarker.length());
        // Remove Cloudinary version
        if (publicId.startsWith("v")) {
            int slashIndex = publicId.indexOf("/");
            if (slashIndex != -1) {
                String version = publicId.substring(0, slashIndex);
                if (version.matches("v\\d+")) {
                    publicId = publicId.substring(slashIndex + 1);
                }
            }
        }

        // Remove extension
        int dotIndex =
                publicId.lastIndexOf(".");
        if (dotIndex != -1) {
            publicId = publicId.substring(0, dotIndex);
        }
        return publicId;
    }


    public Map<String, String> generateUploadSignature() {

        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", "univibe/post-images"
        );

        String signature = cloudinary.apiSignRequest(
                paramsToSign,
                cloudinary.config.apiSecret
        );

        return Map.of(
                "timestamp", String.valueOf(timestamp),
                "signature", signature,
                "apiKey", cloudinary.config.apiKey
        );
    }

    public Map<String, String> generatePostImageUploadSignature() {

        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", "univibe/post-images"
        );

        String signature = cloudinary.apiSignRequest(
                paramsToSign,
                cloudinary.config.apiSecret
        );

        return Map.of(
                "timestamp", String.valueOf(timestamp),
                "signature", signature,
                "apiKey", cloudinary.config.apiKey
        );
    }

    public Map<String, String> generatePostVideoUploadSignature() {

        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", "univibe/post-videos"
        );

        String signature = cloudinary.apiSignRequest(
                paramsToSign,
                cloudinary.config.apiSecret
        );

        return Map.of(
                "timestamp", String.valueOf(timestamp),
                "signature", signature,
                "apiKey", cloudinary.config.apiKey
        );
    }

    public void deletePostMedia(
            String mediaUrl,
            String mediaType
    ) throws IOException {

        if (mediaUrl == null || mediaUrl.isBlank()) {
            return;
        }

        String publicId = extractPublicId(mediaUrl);

        if (publicId == null || publicId.isBlank()) {
            return;
        }

        String resourceType =
                "VIDEO".equalsIgnoreCase(mediaType)
                        ? "video"
                        : "image";

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap(
                        "resource_type",
                        resourceType
                )
        );
    }

    public String uploadPostVideo(MultipartFile file)
            throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Post video is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException("Only video files are allowed");
        }
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder",
                        "univibe/post-videos",
                        "resource_type",
                        "video"
                )
        );

        return result.get("secure_url").toString();
    }

    public Map<String, String> generatePostMediaUploadSignature(
            String resourceType
    ) {

        if (resourceType == null || resourceType.isBlank()) {
            resourceType = "image";
        }

        String normalizedResourceType =
                resourceType.equalsIgnoreCase("video")
                        ? "video"
                        : "image";

        long timestamp =
                System.currentTimeMillis() / 1000;

        String folder =
                normalizedResourceType.equals("video")
                        ? "univibe/post-videos"
                        : "univibe/post-images";

        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", folder
        );

        String signature = cloudinary.apiSignRequest(
                paramsToSign,
                cloudinary.config.apiSecret
        );

        return Map.of(
                "timestamp", String.valueOf(timestamp),
                "signature", signature,
                "apiKey", cloudinary.config.apiKey
        );
    }
}