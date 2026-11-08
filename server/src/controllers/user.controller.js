import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSelf() } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, community, photoUrl } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.profile.bio = bio;
  if (photoUrl !== undefined) user.profile.photoUrl = photoUrl;

  if (community !== undefined && community !== user.community.name) {
    user.community.name = community;
    // A verification only applies to the community that was checked
    if (user.verificationStatus.community === 'verified') {
      user.verificationStatus.community = 'none';
    }
  }

  await user.save();
  res.json({ success: true, data: { user: user.toSelf() } });
});

// Other users only see the public view (no email or phone)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, accountStatus: 'active' });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');
  res.json({ success: true, data: { user: user.toPublic() } });
});