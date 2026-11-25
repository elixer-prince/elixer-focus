import {
  DEFAULT_PROFILE_NAME,
  useProfileStore,
} from "@/features/profile/stores/profile-store";

beforeEach(() => {
  localStorage.clear();
  useProfileStore.setState({ displayName: DEFAULT_PROFILE_NAME, bio: "" });
});

describe("profile store", () => {
  it("AC-1, AC-7: uses the default identity and persists profile updates", () => {
    expect(useProfileStore.getState()).toMatchObject({
      displayName: DEFAULT_PROFILE_NAME,
      bio: "",
    });

    useProfileStore
      .getState()
      .updateProfile("  Alex  ", "Building focus habits.");

    expect(useProfileStore.getState()).toMatchObject({
      displayName: "Alex",
      bio: "Building focus habits.",
    });
    expect(
      JSON.parse(localStorage.getItem("profile-storage")!).state,
    ).toMatchObject({
      displayName: "Alex",
      bio: "Building focus habits.",
    });
  });

  it("AC-1, AC-6: restores the default display name when the saved name is blank", () => {
    useProfileStore.getState().updateProfile("   ", "A short bio.");

    expect(useProfileStore.getState().displayName).toBe(DEFAULT_PROFILE_NAME);
  });

  it("AC-7: rehydrates saved profile details", async () => {
    localStorage.setItem(
      "profile-storage",
      JSON.stringify({
        state: { displayName: "Saved name", bio: "Saved bio" },
        version: 1,
      }),
    );

    await useProfileStore.persist.rehydrate();

    expect(useProfileStore.getState()).toMatchObject({
      displayName: "Saved name",
      bio: "Saved bio",
    });
  });
});
