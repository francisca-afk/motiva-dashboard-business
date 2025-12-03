"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAppContext } from "@/context/AppContext";
import { getKnowledgeFiles, processKnowledgeFile, uploadKnowledgeFile, deleteKnowledgeFile } from "@/services/apiService";
import { FileIcon, TrashBinIcon, CheckCircleIcon, TimeIcon, DownloadIcon, AlertIcon } from "@/icons/index";
import { Eye, Loader2, CheckCircle, Clock, AlertCircle, FileText, Trash } from "lucide-react";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import PageGuard from "@/components/auth/PageGuard";

export default function BusinessFiles() {
  const { business, hasPermission, permissionsLoaded } = useAppContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState(null);

  if (!permissionsLoaded) return null;
  if (!hasPermission('view_kb')) {
    return <PageGuard />;
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  //  "text/markdown",
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds 10MB limit");
      setUploadStatus("error");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload PDF, DOC or DOCX.");
      setUploadStatus("error");
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setErrorMessage("");
  };

const handleUpload = async () => {
  if (!selectedFile || !business?._id) return;

  try {
    setUploading(true);
    setUploadStatus("uploading");
    setErrorMessage("");

    //Upload file
    const response = await uploadKnowledgeFile(business._id, selectedFile);
    const uploadResponse = response.data;
    const fileId = uploadResponse._id || uploadResponse.id;
    setUploadedFileId(fileId);


    // Process file
    setUploadStatus("processing");
    await processKnowledgeFile(fileId);

    // Refresh file list after 2 seconds
    setUploadStatus("success");
    setSelectedFile(null);

    // Refresh file list after 1 second
    setTimeout(async () => {
      await fetchFiles();
      setSelectedFile(null);
      setUploadStatus(null);
      setUploadedFileId(null);
    }, 1000);

  } catch (err) {
    console.error("❌ Error uploading/processing file:", err);
    setUploadStatus("error");
    setErrorMessage("Failed to upload and process the document: " + err.message);
  } finally {
    setUploading(false);
  }
};

const handleCancelUpload = () => {
  setSelectedFile(null);
  setUploadStatus(null);
  setErrorMessage("");
  setUploadedFileId(null);
};

  const fetchFiles = async () => {
    if (!business?._id) return;
    try {
      setLoading(true);
      console.log("📂 Fetching files for business:", business._id);
      const response = await getKnowledgeFiles(business._id);
      const data = response.data;
      console.log("✅ Files loaded:", data);
      setFiles(data);
    } catch (err) {
      console.error("❌ Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (fileId) => {
    try {
      await processKnowledgeFile(fileId);
      // Refresh immediately after processing
      await fetchFiles();
    } catch (err) {
      console.error("❌ Error processing file:", err);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) return;
    try {
      await deleteKnowledgeFile(fileId);
      await fetchFiles();
    } catch (err) {
      console.error("❌ Error deleting file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [business]);

  const headers = ["Document", "Status", "Size", "Uploaded", "Actions"];

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Business Files" />
      <div className="space-y-6">
    
       { hasPermission('edit_kb') && (
        <>
        {/* Upload Section */}
        <ComponentCard title="Upload Documents">
          <div className="space-y-4">
            {/* File Input Area */}
            <div>
              <Label htmlFor="knowledge-file">Select Document</Label>
              <FileInput
                id="knowledge-file"
                onChange={handleFileSelect}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="mt-2"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: PDF, DOC, DOCX, TXT. Max size: 10MB
              </p>
            </div>

            {/* Upload Status */}
            {selectedFile && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        uploadStatus === "success"
                          ? "bg-success-50 dark:bg-success-500/10"
                          : uploadStatus === "processing"
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : uploadStatus === "error"
                          ? "bg-error-50 dark:bg-error-500/10"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {uploadStatus === "success" ? (
                        <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
                      ) : uploadStatus === "processing" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" />
                      ) : uploadStatus === "error" ? (
                        <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>

                      {/* Status Message */}
                      <div className="mt-2">
                        {uploadStatus === "uploading" && (
                          <div className="space-y-2">
                            <p className="text-sm text-brand-600 dark:text-brand-400">
                              Uploading document...
                            </p>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                              <div className="h-full bg-brand-400 rounded-full animate-pulse w-2/3"></div>
                            </div>
                          </div>
                        )}

                        {uploadStatus === "processing" && (
                          <div className="space-y-1">
                            <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">
                              Processing document...
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Extracting text, generating embeddings, and indexing content
                            </p>
                          </div>
                        )}

                        {uploadStatus === "success" && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircleIcon className="h-4 w-4 text-success-600 dark:text-success-400" />
                            <p className="text-sm text-success-600 dark:text-success-400 font-medium">
                              Document processed successfully
                            </p>
                          </div>
                        )}

                        {uploadStatus === "error" && (
                          <div className="space-y-1">
                            <p className="text-sm text-error-600 dark:text-error-400 font-medium">
                              Upload failed
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {errorMessage || "Something went wrong. Please try again."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancel/Retry Button */}
                  {(uploadStatus === "uploading" || uploadStatus === "error") && (
                    <button
                      onClick={uploadStatus === "error" ? handleUpload : handleCancelUpload}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {uploadStatus === "error" ? "Retry" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && uploadStatus !== "success" && uploadStatus !== "processing" && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="h-4 w-4 rotate-180" />
                Upload & Process Document
              </button>
            )}
          </div>
        </ComponentCard>
        </>
        )}

        <ComponentCard title="Business Documents">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            </div>
          ) : (
            <DataTable
              headers={headers} 
              rows={files}
              renderRow={(file) => (
                <>
                  {/* Document */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                        <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex flex-col">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-800 hover:text-brand-600 dark:text-white/90 dark:hover:text-brand-400 transition-colors"
                        >
                          {file.title || file.metadata?.originalName || file.originalName}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {file.metadata?.originalName || file.originalName}
                          </span>
                          {file.chunkCount > 0 && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                {file.chunkCount} chunks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={
                        file.tags?.includes("embedded")
                          ? "success"
                          : file.tags?.includes("error")
                          ? "error"
                          : "warning"
                      }
                    >
                      {file.tags?.includes("embedded") ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3" />
                          Processed
                        </span>
                      ) : file.tags?.includes("error") ? (
                        "Error"
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </Badge>
                  </td>

                  {/* Size */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.metadata?.size)}
                    </span>
                  </td>

                  {/* Uploaded */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(file.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          window.open(file.fileUrl, "_blank")
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>

                      {!file.tags?.includes("embedded") && (
                        <button
                          onClick={() => processFile(file._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
                        >
                          <Loader2 className="h-4 w-4" />
                          Process
                        </button>
                      )}

                      { hasPermission('edit_kb') && (
                        <>
                      <button
                        onClick={() => deleteFile(file._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                        title="Delete file"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </button>
                      </>
                      )}
                    </div>
                  </td>
                </>
              )}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
