with open("src/stores/useAuthStore.ts", "r") as f:
    content = f.read()

if "login:" not in content and "setUser:" in content:
    content = content.replace(
        "setUser: (user, token, refreshToken) => {",
        "login: (user, token, refreshToken) => set((state) => { state.setUser(user, token, refreshToken); return {}; }),\n  setUser: (user, token, refreshToken) => {"
    )

with open("src/stores/useAuthStore.ts", "w") as f:
    f.write(content)
print("useAuthStore patched with login")
