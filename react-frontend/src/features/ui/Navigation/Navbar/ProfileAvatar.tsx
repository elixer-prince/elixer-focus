const ProfileAvatar = () => {
    return (
        // Profile Circle
        <div className="avatar hidden">
            <div className="ring-primary ring-offset-base-100 w-8 rounded-full ring-3 ring-offset-2">
                {/* Profile Picture */}
                <img
                    src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                    alt=""
                />
            </div>
        </div>
    );
};

export default ProfileAvatar;
