with open("backend/app/api/routes/ai_actions.py", "r") as f:
    content = f.read()

if "delete_memory" not in content:
    content += """
@router.delete("/memory/{key}")
async def delete_memory(key: str, current_user: User = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        service = ConversationService(session)
        try:
            await service.delete_memory(str(current_user.id), key)
            return {"status": "success"}
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
"""
    with open("backend/app/api/routes/ai_actions.py", "w") as f:
        f.write(content)
print("Updated ai_actions.py")
