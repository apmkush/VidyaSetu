import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";
import { UserModel } from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

// Create new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds, isClassGroup, classInfo } = req.body;
    const createdBy = req.user.id;
    console.log('creator ' , createdBy) ; 

    // Add creator as admin and member
    const allMembers = [...new Set([createdBy, ...memberIds])];
    const admins = [createdBy];

    const newGroup = new Group({
      name,
      description,
      createdBy,
      members: allMembers,
      admins,
      isClassGroup,
      classInfo: isClassGroup ? classInfo : null
    });

    await newGroup.save();
    
    // Populate group data for response
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('members', 'name email profilePic userRole')
      .populate('admins', 'name email profilePic')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      group: populatedGroup
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate('members', 'name email profilePic userRole')
      .populate('admins', 'name email profilePic')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Get group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members', 'name email profilePic userRole branch semester section')
      .populate('admins', 'name email profilePic')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
};

// Send message to group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, file, fileType } = req.body;
    const senderId = req.user._id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    let fileUrl;
    if (file) {
      const uploadOptions = {
        resource_type: 'auto',
        folder: 'group_chat_files',
        use_filename: true
      };

      if (fileType.startsWith('image/')) {
        uploadOptions.format = 'webp';
      }
      if (fileType.startsWith('video/')) {
        uploadOptions.transformation = [
          { quality: 'auto' },
          { format: 'mp4' },
          { codec: 'h264' }
        ];
      }

      const uploadResponse = await cloudinary.uploader.upload(
        `data:${fileType};base64,${file}`,
        uploadOptions
      );
      
      fileUrl = uploadResponse.secure_url;
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      file: fileUrl,
      fileType: fileUrl ? fileType : null,
      fileResourceType: fileUrl ? 'auto' : null,
      status: 'sent'
    });

    await newMessage.save();

    // Populate message with sender info
    const populatedMessage = await GroupMessage.findById(newMessage._id)
      .populate('senderId', 'name email profilePic userRole');

    // Emit to all group members
    group.members.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("receiveGroupMessage", populatedMessage);
      }
    });

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate('senderId', 'name email profilePic userRole')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Add members to group (admin only)
export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Add new members
    const newMembers = [...new Set([...group.members, ...memberIds])];
    group.members = newMembers;
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'name email profilePic userRole')
      .populate('admins', 'name email profilePic');

    res.status(200).json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error("Error adding members to group:", error);
    res.status(500).json({ error: "Failed to add members" });
  }
};

// Remove member from group (admin only)
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    // Cannot remove yourself if you're the only admin
    if (memberId === userId.toString() && group.admins.length === 1) {
      return res.status(400).json({ error: "Cannot remove the only admin" });
    }

    group.members = group.members.filter(member => member.toString() !== memberId);
    
    // Remove from admins if they were admin
    group.admins = group.admins.filter(admin => admin.toString() !== memberId);

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'name email profilePic userRole')
      .populate('admins', 'name email profilePic');

    res.status(200).json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error("Error removing member from group:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// Get students for class group creation (teachers only)
export const getStudentsForClassGroup = async (req, res) => {
  try {
    const { branch, semester, section, batchYear } = req.query;
    
    if (req.user.userRole !== 'teacher') {
      return res.status(403).json({ error: "Only teachers can access this" });
    }

    const students = await UserModel.find({
      userRole: 'student',
      branch,
      semester: parseInt(semester),
      section,
      batchYear: parseInt(batchYear)
    }).select('name email profilePic regno');

    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};