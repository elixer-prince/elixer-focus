const ProfileAvatar = () => {
  return (
    <div className="profile-avatar avatar hidden">
      <div className="profile-avatar-ring ring-primary ring-offset-base-100 w-8 rounded-full ring-3 ring-offset-2">
        <img
          className="profile-picture"
          src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
          alt="Profile Avatar"
        />
      </div>
    </div>
  );
};

export default ProfileAvatar;
