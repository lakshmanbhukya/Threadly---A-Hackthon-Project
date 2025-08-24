const express = require("express");
const Thread = require("../models/Thread");
const User = require("../models/User");
const Post = require("../models/Post"); // Add this import at the top
const { requireAuth, validateThread } = require("../middleware/validation");
const {
  uploadMedia,
  uploadMediaToCloudinary,
} = require("../middleware/upload");
const { notifyNewThread } = require("../utils/notifications");
const router = express.Router();

router.post(
  "/create",
  requireAuth,
  uploadMedia.array("media", 10),
  async (req, res) => {
    try {
      const {
        title,
        description,
        topic,
        postType,
        tags,
        linkUrl,
        pollOptions,
      } = req.body;

      // Validate required fields based on post type
      if (!title || !topic) {
        return res.status(400).json({ error: "Title and topic are required" });
      }

      if (postType === "media" && (!req.files || req.files.length === 0)) {
        return res
          .status(400)
          .json({ error: "Media files are required for media posts" });
      }

      if (postType === "link" && !linkUrl) {
        return res
          .status(400)
          .json({ error: "Link URL is required for link posts" });
      }

      if (
        postType === "poll" &&
        (!pollOptions || JSON.parse(pollOptions).length < 2)
      ) {
        return res
          .status(400)
          .json({ error: "At least 2 poll options are required" });
      }

      // Process media files if present
      let mediaFiles = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await uploadMediaToCloudinary(
              file.buffer,
              file.mimetype
            );
            mediaFiles.push(result);
          } catch (uploadError) {
            console.error("Media upload failed:", uploadError);
            return res.status(500).json({ error: "Media upload failed" });
          }
        }
      }

      // Parse JSON fields
      let parsedTags = [];
      let parsedPollOptions = [];

      if (tags) {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
        }
      }

      if (pollOptions) {
        try {
          parsedPollOptions = JSON.parse(pollOptions).map((option) => ({
            text: option.trim(),
            votes: [],
          }));
        } catch (e) {
          return res.status(400).json({ error: "Invalid poll options format" });
        }
      }

      const threadData = {
        title: title.trim(),
        description: description ? description.trim() : "",
        topic: topic.trim(),
        postType: postType || "thread",
        createdBy: req.session.userId,
      };

      // Add optional fields based on post type
      if (parsedTags.length > 0) {
        threadData.tags = parsedTags;
      }

      if (mediaFiles.length > 0) {
        threadData.mediaFiles = mediaFiles;
      }

      if (postType === "link" && linkUrl) {
        threadData.linkUrl = linkUrl.trim();
      }

      if (postType === "poll" && parsedPollOptions.length > 0) {
        threadData.pollOptions = parsedPollOptions;
      }

      const thread = new Thread(threadData);
      await thread.save();

      notifyNewThread(thread);

      res.status(201).json({
        message: "Thread created successfully",
        threadId: thread._id,
        thread: thread,
      });
    } catch (error) {
      // console.error("Thread creation error:", error);
      res.status(500).json({ error: "Thread creation failed" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate("createdBy", "username profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate(
      "createdBy",
      "username profilePicture"
    );

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ thread });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

router.put("/:id", requireAuth, validateThread, async (req, res) => {
  try {
    const { title, description, topic } = req.body;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (thread.createdBy.toString() !== req.session.userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this thread" });
    }

    const updatedThread = await Thread.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        topic: topic.trim(),
      },
      { new: true }
    ).populate("createdBy", "username profilePicture");

    res.json({
      message: "Thread updated successfully",
      thread: updatedThread,
    });
  } catch (error) {
    res.status(500).json({ error: "Thread update failed" });
  }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const userId = req.session.userId;
    const isLiked = thread.likes.includes(userId);

    if (isLiked) {
      thread.likes.pull(userId);
    } else {
      thread.likes.push(userId);
    }

    await thread.save();

    res.json({
      message: isLiked ? "Thread unliked" : "Thread liked",
      likesCount: thread.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update thread like" });
  }
});

// POST /threads/:id/downvote
router.post("/:id/downvote", requireAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    const userId = req.session.userId;
    const isDownvoted = thread.downvotes.includes(userId);
    if (isDownvoted) {
      thread.downvotes.pull(userId);
    } else {
      thread.downvotes.push(userId);
      // Remove upvote if present
      thread.likes.pull(userId);
    }
    await thread.save();
    res.json({
      message: isDownvoted ? "Thread undownvoted" : "Thread downvoted",
      downvotesCount: thread.downvotes.length,
      isDownvoted: !isDownvoted,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update thread downvote" });
  }
});

// Vote on poll options
router.post("/:id/poll-vote", requireAuth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (thread.postType !== "poll") {
      return res.status(400).json({ error: "This thread is not a poll" });
    }

    if (optionIndex < 0 || optionIndex >= thread.pollOptions.length) {
      return res.status(400).json({ error: "Invalid poll option" });
    }

    const userId = req.session.userId;
    const option = thread.pollOptions[optionIndex];

    // Check if user already voted on this option
    const hasVoted = option.votes.includes(userId);

    if (hasVoted) {
      // Remove vote
      option.votes.pull(userId);
    } else {
      // Remove previous votes on other options (one vote per user)
      thread.pollOptions.forEach((opt, index) => {
        if (index !== optionIndex) {
          opt.votes.pull(userId);
        }
      });
      // Add vote to selected option
      option.votes.push(userId);
    }

    await thread.save();

    res.json({
      message: hasVoted ? "Vote removed" : "Vote added",
      pollOptions: thread.pollOptions,
      totalVotes: thread.pollOptions.reduce(
        (sum, opt) => sum + opt.votes.length,
        0
      ),
    });
  } catch (error) {
    // console.error("Poll vote error:", error);
    res.status(500).json({ error: "Failed to update poll vote" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const user = await User.findById(req.session.userId);
    const isOwner =
      thread.createdBy.toString() === req.session.userId.toString();
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this thread" });
    }

    await Thread.findByIdAndDelete(req.params.id);

    res.json({ message: "Thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Thread deletion failed" });
  }
});

// GET /threads/user/:userId - Get threads created by a user
router.get("/user/:userId", async (req, res) => {
  try {
    const threads = await Thread.find({ createdBy: req.params.userId })
      .populate("createdBy", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user's threads" });
  }
});

// GET /threads/liked/:userId - Get threads liked by a user
router.get("/liked/:userId", async (req, res) => {
  try {
    const threads = await Thread.find({ likes: req.params.userId })
      .populate("createdBy", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch liked threads" });
  }
});

// GET /threads/commented/:userId - Get threads commented on by a user
router.get("/commented/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.userId }).select(
      "threadId"
    );
    const threadIds = [...new Set(posts.map((p) => p.threadId))];
    const threads = await Thread.find({ _id: { $in: threadIds } })
      .populate("createdBy", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commented threads" });
  }
});

module.exports = router;
