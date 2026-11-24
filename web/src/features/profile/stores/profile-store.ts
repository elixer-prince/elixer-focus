import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";

type ProfileState = {
  displayName: string;
  bio: string;
};

type ProfileActions = {
  updateProfile: (displayName: string, bio: string) => void;
};

type ProfileStore = ProfileState & ProfileActions;

export const DEFAULT_PROFILE_NAME = "Focus User";

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      displayName: DEFAULT_PROFILE_NAME,
      bio: "",
      updateProfile: (displayName, bio) =>
        set({
          displayName: displayName.trim() || DEFAULT_PROFILE_NAME,
          bio,
        }),
    }),
    createPersistOptions<ProfileStore>({
      name: "profile-storage",
      version: 1,
    }),
  ),
);

export const useProfileDisplayName = () =>
  useProfileStore((state) => state.displayName);

export const useProfileBio = () => useProfileStore((state) => state.bio);

export const useUpdateProfile = () =>
  useProfileStore((state) => state.updateProfile);
