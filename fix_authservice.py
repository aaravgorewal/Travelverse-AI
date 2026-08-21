with open("src/services/authService.ts", "r") as f:
    lines = f.readlines()

new_lines = []
in_dupe = False
for i, line in enumerate(lines):
    if "async getCurrentUser(): Promise<UserProfile> {" in line:
        if any("async getCurrentUser():" in l for l in lines[:i]):
            in_dupe = True
            
    if "async logout(): Promise<void> {" in line:
        if any("async logout():" in l for l in lines[:i]):
            in_dupe = True
            
    if not in_dupe:
        new_lines.append(line)
        
    if in_dupe and line.strip() == "},":
        in_dupe = False

with open("src/services/authService.ts", "w") as f:
    f.writelines(new_lines)

# Also fix the login / completeOnboarding in useAuthStore by adding completeOnboarding stub back
with open("src/stores/useAuthStore.ts", "r") as f:
    store = f.read()

if "completeOnboarding: " not in store:
    store = store.replace(
        "updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),",
        "updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),\n  completeOnboarding: (prefs) => set((state) => ({ user: state.user ? { ...state.user, onboardingCompleted: true, travelPreferences: prefs } : null })),"
    )
if "completeOnboarding: (preferences: any) => void;" not in store:
    store = store.replace(
        "updateUser: (updates: Partial<UserProfile>) => void;",
        "updateUser: (updates: Partial<UserProfile>) => void;\n  completeOnboarding: (preferences: any) => void;"
    )

with open("src/stores/useAuthStore.ts", "w") as f:
    f.write(store)
