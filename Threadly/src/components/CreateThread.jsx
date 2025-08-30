import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

// Minimal Card, CardHeader, CardTitle, CardContent, Label, Textarea, and Select
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-card border border-card rounded-lg shadow-card ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-bold mb-2 ${className}`}>{children}</h2>
);
const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);
const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
    {children}
  </label>
);
const Textarea = ({ value, onChange, className = "", ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
);
// Minimal Select
const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary"
  >
    <option value="">Choose a topic...</option>
    {children}
  </select>
);
const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

// Minimal toast implementation
function useToast() {
  return {
    toast: ({ title, description, variant = "default" }) => {
      console.log(`Toast ${variant}:`, title, description || "");
      alert(`${title}\n${description || ""}`);
    },
  };
}

// Mock topics
const mockTopics = [
  { id: "1", name: "Technology", threadCount: 10 },
  { id: "2", name: "Science", threadCount: 5 },
  { id: "3", name: "Programming", threadCount: 8 },
  { id: "4", name: "Gaming", threadCount: 6 },
  { id: "5", name: "Movies", threadCount: 3 },
];

const CreateThread = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    topicId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.topicId
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API call
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully.",
      });
      navigate("/");
    } catch (err) {
      console.error("Thread creation error:", err);
      toast({
        title: "Error",
        description: "Unable to create thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Thread</CardTitle>
          <p className="text-neutral/60">
            Share your thoughts and start a discussion with the community.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <input
                id="title"
                placeholder="Enter a descriptive title for your thread..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-base text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={300}
              />
              <p className="text-sm text-neutral/60">
                {formData.title.length}/300 characters
              </p>
            </div>
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) => handleInputChange("topicId", value)}
              >
                {mockTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name} ({topic.threadCount} threads)
                  </SelectItem>
                ))}
              </Select>
            </div>
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your thread content here. You can ask questions, share insights, or start a discussion..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="min-h-[200px] text-base"
                maxLength={10000}
              />
              <p className="text-sm text-neutral/60">
                {formData.content.length}/10000 characters
              </p>
            </div>
            {/* Preview */}
            {(formData.title || formData.content) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="bg-gray-100">
                  <CardContent className="p-4">
                    {formData.title && (
                      <h3 className="font-semibold text-lg mb-2">
                        {formData.title}
                      </h3>
                    )}
                    {formData.content && (
                      <p className="text-sm text-neutral/60 whitespace-pre-wrap">
                        {formData.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title.trim() ||
                  !formData.content.trim() ||
                  !formData.topicId
                }
              >
                {isSubmitting ? "Creating..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateThread;