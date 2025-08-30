import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/Textarea";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createPost, fetchAllThreads } from "../lib/api";
import { validateFile, getFileType, formatFileSize } from "../config/config";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedThread, setSelectedThread] = useState("");
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const data = await fetchAllThreads();
      setThreads(data.threads || []);
    } catch (error) {
      console.error("Failed to load threads:", error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
    }

    if (mediaFiles.length + validFiles.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    setMediaFiles([...mediaFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add content or media");
      return;
    }

    if (!selectedThread) {
      toast.error("Please select a thread");
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        threadId: selectedThread,
        isAnonymous: isAnonymous.toString(),
        mediaFiles
      };

      await createPost(postData);
      
      toast.success("Post created successfully!");
      navigate(`/thread/${selectedThread}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Thread</label>
            <select
              value={selectedThread}
              onChange={(e) => setSelectedThread(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background"
              required
            >
              <option value="">Choose a thread...</option>
              {threads.map((thread) => (
                <option key={thread._id} value={thread._id}>
                  {thread.title}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] resize-none"
          />
          
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {getFileType(file) === "image" ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-5 h-5 mr-2" />
                Add Media
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Post anonymously</span>
              </label>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Create Post"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePost;