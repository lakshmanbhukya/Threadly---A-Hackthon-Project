const Notification = require('../models/Notification');

let io;

const initializeSocket = (socketIO) => {
  io = socketIO;
};

const createNotification = async (recipient, type, message, relatedId, relatedModel, createdBy = null) => {
  try {
    const notification = new Notification({
      recipient,
      type,
      message,
      relatedId,
      relatedModel,
      createdBy
    });
    
    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'username');
    
    // Emit real-time notification
    if (io) {
      io.to(`user_${recipient}`).emit('notification', populatedNotification);
    }
    
    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const notifyNewThread = async (thread) => {
  try {
    // Notify all users except the creator
    const users = await require('../models/User').find({ 
      _id: { $ne: thread.createdBy },
      isActive: true 
    });
    
    for (const user of users) {
      await createNotification(
        user._id,
        'new_thread',
        `New thread: ${thread.title}`,
        thread._id,
        'Thread',
        thread.createdBy
      );
    }
  } catch (error) {
    console.error('Error notifying new thread:', error);
  }
};

const notifyNewPost = async (post) => {
  try {
    if (post.threadId) {
      const thread = await require('../models/Thread').findById(post.threadId);
      if (thread && thread.createdBy && post.createdBy !== thread.createdBy.toString()) {
        await createNotification(
          thread.createdBy,
          'new_post',
          `New post in your thread: ${thread.title}`,
          post._id,
          'Post',
          post.createdBy
        );
      }
    }
  } catch (error) {
    console.error('Error notifying new post:', error);
  }
};

const notifyNewComment = async (post, comment) => {
  try {
    if (post.createdBy && comment.createdBy !== post.createdBy.toString()) {
      await createNotification(
        post.createdBy,
        'new_comment',
        'Someone commented on your post',
        post._id,
        'Post',
        comment.createdBy
      );
    }
  } catch (error) {
    console.error('Error notifying new comment:', error);
  }
};

const notifyPostLiked = async (post, userId) => {
  try {
    if (post.createdBy && userId !== post.createdBy.toString()) {
      await createNotification(
        post.createdBy,
        'post_liked',
        'Someone liked your post',
        post._id,
        'Post',
        userId
      );
    }
  } catch (error) {
    console.error('Error notifying post liked:', error);
  }
};

module.exports = {
  initializeSocket,
  createNotification,
  notifyNewThread,
  notifyNewPost,
  notifyNewComment,
  notifyPostLiked
};