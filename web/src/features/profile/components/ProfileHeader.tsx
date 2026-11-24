import { Button, Input } from "@/components/ui";
import {
  useProfileBio,
  useProfileDisplayName,
  useUpdateProfile,
} from "@/stores";
import { useState, type FormEvent } from "react";
import { MdAccountCircle, MdEdit } from "react-icons/md";

const ProfileHeader = () => {
  const displayName = useProfileDisplayName();
  const bio = useProfileBio();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const startEditing = () => {
    setDraftName(displayName);
    setDraftBio(bio);
    setSaveError("");
    setSaveMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError("");

    try {
      updateProfile(draftName, draftBio);
      setIsEditing(false);
      setSaveMessage("Your profile has been updated.");
    } catch {
      setSaveError("Your profile could not be saved. Please try again.");
    }
  };

  return (
    <section className="bg-base-100 rounded-box border-base-300 space-y-6 border p-6 shadow-sm transition-colors duration-500 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="bg-primary/10 text-primary flex size-24 shrink-0 items-center justify-center rounded-full sm:size-28">
          <MdAccountCircle aria-hidden="true" className="size-20 sm:size-24" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base-content/70 mb-1 text-sm font-semibold tracking-wide uppercase">
                Your profile
              </p>
              <h2 className="text-base-content text-2xl font-bold break-words sm:text-3xl">
                {displayName}
              </h2>
              <p className="text-base-content/60 mt-2 max-w-2xl whitespace-pre-wrap">
                {bio || "Add a short note about what you are working toward."}
              </p>
            </div>

            {!isEditing && (
              <Button
                color="outline"
                onClick={startEditing}
                aria-label="Edit profile"
              >
                <MdEdit aria-hidden="true" className="size-5" />
                Edit profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <form
          className="border-base-300 space-y-4 border-t pt-5"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Display name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoComplete="name"
                aria-describedby="profile-name-help"
              />
              <p
                id="profile-name-help"
                className="text-base-content/50 mt-1 text-sm"
              >
                Leave blank to use Focus User.
              </p>
            </div>

            <div className="w-full">
              <label className="label" htmlFor="profile-bio">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                id="profile-bio"
                className="textarea textarea-primary min-h-24 w-full"
                value={draftBio}
                onChange={(event) => setDraftBio(event.target.value)}
                aria-describedby="profile-bio-help"
              />
              <p
                id="profile-bio-help"
                className="text-base-content/50 mt-1 text-sm"
              >
                Share a little about your focus journey.
              </p>
            </div>
          </div>

          {saveError && (
            <p className="text-error text-sm" role="alert">
              {saveError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Save changes</Button>
            <Button color="ghost" onClick={cancelEditing}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {saveMessage && !isEditing && (
        <p className="text-success text-sm" role="status">
          {saveMessage}
        </p>
      )}
    </section>
  );
};

export default ProfileHeader;
