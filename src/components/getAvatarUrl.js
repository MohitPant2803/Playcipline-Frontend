export const getAvatarUrl = (style, seed) => {
  if (!style || !seed) return '';
  // Using png format as requested
  return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&backgroundColor=transparent`;
};